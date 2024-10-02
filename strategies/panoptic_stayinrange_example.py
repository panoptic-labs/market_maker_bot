import asyncio
import bisect
import numpy as np

from hummingbot.client.settings import GatewayConnectionSetting
# from hummingbot.core.event.events import TradeType
from hummingbot.core.gateway.gateway_http_client import GatewayHttpClient
from hummingbot.core.utils.async_utils import safe_ensure_future
from hummingbot.strategy.script_strategy_base import Decimal, ScriptStrategyBase

def tick_to_absolutePrice(tick): 
    absolutePrice = np.power(10, tick*np.log10(1.0001))
    return absolutePrice 

def absolutePrice_to_adjustedPrice(absolutePrice, t0_decimals, t1_decimals): 
    refactor = np.power(10, t0_decimals-t1_decimals)
    adjustedPrice = absolutePrice * refactor 
    return adjustedPrice

def tick_to_adjustedPrice(tick, t0_decimals, t1_decimals):
    absolutePrice = tick_to_absolutePrice(tick)
    adjustedPrice = absolutePrice_to_adjustedPrice(absolutePrice, t0_decimals, t1_decimals)
    return adjustedPrice

def adjustedPrice_to_absolutePrice(adjustedPrice, t0_decimals, t1_decimals): 
    refactor = np.power(10, t0_decimals-t1_decimals)
    absolutePrice = adjustedPrice/refactor
    return absolutePrice

def absolutePrice_to_tick(absolutePrice): 
    tick = np.log10(absolutePrice)/np.log10(1.0001)
    return tick 

def adjustedPrice_to_tick(adjustedPrice, t0_decimals, t1_decimals):
    absolutePrice = adjustedPrice_to_absolutePrice(adjustedPrice, t0_decimals, t1_decimals)
    tick = absolutePrice_to_tick(absolutePrice)
    return tick 


class TradePanoptions(ScriptStrategyBase):
    """
    This example shows how to call the /options/trade Gateway endpoint to execute a panoptic transaction
    """
    # options params
    connector_chain_network = "panoptic_ethereum_sepolia"
    # connector_chain_network = "uniswap_ethereum_mainnet"
    trading_pair = {"t0-t1"}
    markets = {}
    launched = False
    initialized = False
    tick_count = 0


    def on_tick(self):
        self.logger().info(f"Tick count: {self.tick_count}")
        self.tick_count = self.tick_count + 1
        # only execute once. Remove flag to execute each tick. 
        if not self.launched:
            self.logger().info(f"Launching...")
            self.launched = True
            safe_ensure_future(self.initialize())
        # repeat on-tick
        if self.initialized: 
            safe_ensure_future(self.async_task())


    # async task since we are using Gateway
    async def async_task(self):

        self.logger().info(f"Checking price...")
        self.logger().info(f"POST /options/getSpotPrice [ connector: {self.connector} ]")
        response = await GatewayHttpClient.get_instance().api_request(
            method="post",
            path_url="options/getSpotPrice",
            params=self.request_payload,
            fail_silently=False
        )
        self.spotPrice=response['spotPrice']
        self.logger().info(f"Price: {self.spotPrice}")
        # Convert the spot price to a tick location
        self.logger().info(f"Converting spot price to tick location...")

        self.tick_location = adjustedPrice_to_tick(self.spotPrice, self.t0_decimals, self.t1_decimals)
        self.logger().info(f"Tick location: {self.tick_location}")
        
        self.logger().info(f"Finding relevant Uniswap pool tick locations...")
        lower_idx = bisect.bisect_right(self.ticks, self.tick_location) - 1 
        upper_idx = lower_idx + 1
        lower_tick = self.ticks[lower_idx] if lower_idx >= 0 else None
        upper_tick = self.ticks[upper_idx] if upper_idx < len(self.ticks) else None
        self.logger().info(f"Lower tick: {lower_tick}")
        self.logger().info(f"Upper tick: {upper_tick}")

        self.logger().info(f"Checking queryPositions...")
        self.logger().info(f"POST /options/queryPositions [ connector: {self.connector} ]")
        response = await GatewayHttpClient.get_instance().api_request(
            method="post",
            path_url="options/queryPositions",
            params=self.request_payload,
            fail_silently=False
        )
        self.open_positions = response['openPositionIdList']
        # self.logger().info(f"Open position list: {self.open_positions}")

        # Define position of interest
        self.request_payload.update(
            {
                "width": 4,
                # "strike": int(np.floor(self.tick_location)),
                "callStrike": 50,
                "putStrike": -50,
                "strike": 0,
                "asset": 0,
                "isLong": 1,
                "optionRatio": 1,
                "start": 0, 
            }
        )
        # response = await GatewayHttpClient.get_instance().api_request(
        #     method="post",
        #     path_url="options/createStrangle",
        #     params=self.request_payload,
        #     fail_silently=False
        # )
        # self.logger().info(f"Strangle: {response}")
        response = await GatewayHttpClient.get_instance().api_request(
            method="post",
            path_url="options/createStraddle",
            params=self.request_payload,
            fail_silently=False
        )
        self.logger().info(f"Straddle: {response}")
        new_position = response 

        bad_positions = []
        if len(self.open_positions)>0:
            for idx, position in self.open_positions: 
                outOfRange = False
                self.request_payload["tokenId"] = position
                self.logger().info(f"Position: {self.request_payload['tokenId']}")
                response = await GatewayHttpClient.get_instance().api_request(
                    method="post",
                    path_url="options/unwrapTokenId",
                    params=self.request_payload,
                    fail_silently=False
                )
                self.logger().info(f"Legs in position: {response['numberOfLegs']}")
                for legIdx in range(response['numberOfLegs']): 
                    strike = response['legInfo'][legIdx]['strike']
                    width = response['legInfo'][legIdx]['width']
                    legTickWidth = self.tickSpacing * width 
                    legStrikeHigh = strike + (legTickWidth/2)
                    legStrikeLow = strike - (legTickWidth/2)
                    if lower_tick is not None and upper_tick is not None:
                        if (legStrikeLow <= upper_tick and legStrikeHigh >= lower_tick):
                            self.logger().info(f"      |-> The range overlaps with the Uniswap pool tick range.")
                            legInRange = True
                        else:
                            self.logger().info(f"      |-> The range does not overlap with the Uniswap pool tick range.")
                            legInRange = False
                            outOfRange = True
                    else:
                        self.logger().info(f"      |-> Unable to determine overlap due to missing tick information.")
                    self.logger().info(f"      |-> leg #: {(legIdx+1)}")     
                    self.logger().info(f"      |-> asset: {response['legInfo'][legIdx]['asset']}")
                    self.logger().info(f"      |-> isLong: {response['legInfo'][legIdx]['isLong']}")  
                    self.logger().info(f"      |-> tokenType: {response['legInfo'][legIdx]['tokenType']}") 
                    self.logger().info(f"      |-> strike: {strike}")
                    self.logger().info(f"      |-> width: {width}")
                    self.logger().info(f"      |-> strikeTickLow: {legStrikeLow}")
                    self.logger().info(f"      |-> strikeTickHigh: {legStrikeHigh}")
                    self.logger().info(f"      |-> position leg in range: {legInRange}")
                if outOfRange is True: 
                    bad_positions.append(idx)
        else:
            self.logger().info("No open positions found. Minting new position in-range...")
            self.request_payload.update({
                "panopticPool": self.panopticPoolAddress,
                "positionIdList": self.open_positions.append(new_position) ,
                "positionSize": "1" + "0" * 25,
                "effectiveLiquidityLimit": 0
            })
            tradeData = await GatewayHttpClient.get_instance().api_request(
                method="post",
                path_url="options/mint",
                params=self.request_payload,
                fail_silently=False
            )
            self.logger().info(f"api_request submitted... tradeData: {tradeData}")
            # poll for swap result and print resulting balances
            await self.poll_transaction(self.chain, self.network, tradeData['txHash'])
        
        for badPosition in bad_positions: 
            burnPosition = self.open_positions[badPosition]
            newPositionList = [p for p in self.open_positions if p != burnPosition]
            self.request_payload.update({
                "burnTokenId": burnPosition,
                "newPositionIdList": newPositionList
            })
            tradeData = await GatewayHttpClient.get_instance().api_request(
                method="post",
                path_url="options/burn",
                params=self.request_payload,
                fail_silently=False
            )
            self.logger().info(f"api_request submitted... tradeData: {tradeData}")
            await self.poll_transaction(self.chain, self.network, tradeData['txHash'])

    async def initialize(self): 
        self.t0_symbol, self.t1_symbol = list(self.trading_pair)[0].split("-")
        self.connector, self.chain, self.network = self.connector_chain_network.split("_")

        # fetch wallet address and print balances
        self.gateway_connections_conf = GatewayConnectionSetting.load()
        if len(self.gateway_connections_conf) < 1:
            self.notify("No existing wallet.\n")
            return
        self.wallet = [w for w in self.gateway_connections_conf if w["chain"] == self.chain and w["connector"] == self.connector and w["network"] == self.network]
        self.address = self.wallet[0]['wallet_address']
 
        self.request_payload = {
            "chain": self.chain,
            "network": self.network,
            "connector": self.connector,
            "address": self.address
        } 

        self.logger().info(f"Getting token addresses...")
        self.logger().info(f"POST /options/getTokenAddress [ connector: {self.connector}]")
        self.request_payload["tokenSymbol"]= "t0"
        response = await GatewayHttpClient.get_instance().api_request(
            method="post",
            path_url="options/getTokenAddress",
            params=self.request_payload,
            fail_silently=False
        )
        self.t0_address = response['tokenAddress']
        self.t0_decimals = response['tokenDecimals']
        self.request_payload["t0_address"]=self.t0_address
        self.request_payload["token0Decimals"]=self.t0_decimals
        self.logger().info(f"t0 address: {self.t0_address}")

        self.request_payload["tokenSymbol"]= "t1"
        response = await GatewayHttpClient.get_instance().api_request(
            method="post",
            path_url="options/getTokenAddress",
            params=self.request_payload,
            fail_silently=False
        )
        self.t1_address = response['tokenAddress']
        self.t1_decimals = response['tokenDecimals']
        self.request_payload["t1_address"]=self.t1_address
        self.request_payload["token1Decimals"]=self.t1_decimals
        self.logger().info(f"t1 address: {self.t1_address}")

        self.logger().info(f"Getting UniswapV3 token pool address...")
        self.logger().info(f"POST /options/checkUniswapPool [ connector: {self.connector}]")
        self.request_payload["fee"]=500
        response = await GatewayHttpClient.get_instance().api_request(
            method="post",
            path_url="options/checkUniswapPool",
            params=self.request_payload,
            fail_silently=False
        )
        self.uniswapV3PoolAddress=response["uniswapV3PoolAddress"]
        self.logger().info(f"Uniswap V3 token pool address: {self.uniswapV3PoolAddress}")

        self.logger().info(f"Getting Panoptic token pool address...")
        self.logger().info(f"POST /options/getPanopticPool [ connector: {self.connector}]")
        self.request_payload["uniswapV3PoolAddress"]=self.uniswapV3PoolAddress
        self.request_payload["univ3pool"]=self.uniswapV3PoolAddress
        response = await GatewayHttpClient.get_instance().api_request(
            method="post",
            path_url="options/getPanopticPool",
            params=self.request_payload,
            fail_silently=False
        )
        self.panopticPoolAddress=response["panopticPoolAddress"]
        self.logger().info(f"Panoptic token pool address: {self.panopticPoolAddress}")

        self.logger().info(f"Checking ticks...")
        self.logger().info(f"POST /options/getTickSpacingAndInitializedTicks [ connector: {self.connector} ]")
        response = await GatewayHttpClient.get_instance().api_request(
            method="post",
            path_url="options/getTickSpacingAndInitializedTicks",
            params=self.request_payload,
            fail_silently=False
        )
        self.tickSpacing=response['tickSpacing']
        self.ticks=response['ticks']
        self.logger().info(f"Tick spacing: {self.tickSpacing}")
        self.logger().info(f"Ticks: {self.ticks[0:10]}...")

        self.wallet_address=self.address

        self.initialized=True

