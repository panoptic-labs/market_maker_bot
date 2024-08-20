import asyncio
import numpy as np

from hummingbot.client.settings import GatewayConnectionSetting
# from hummingbot.core.event.events import TradeType
from hummingbot.core.gateway.gateway_http_client import GatewayHttpClient
from hummingbot.core.utils.async_utils import safe_ensure_future
from hummingbot.strategy.script_strategy_base import Decimal, ScriptStrategyBase


class TradePanoptions(ScriptStrategyBase):
    """
    This example shows how to call the /options/trade Gateway endpoint to execute a panoptic transaction
    """
    # options params
    connector_chain_network = "panoptic_ethereum_sepolia"
    markets = {}
    on_going_task = False

    def on_tick(self):
        # only execute once. Remove flag to execute each tick. 
        if not self.on_going_task:
            self.on_going_task = True
            # wrap async task in safe_ensure_future
            safe_ensure_future(self.async_task())

    # async task since we are using Gateway
    async def async_task(self):
        connector, chain, network = self.connector_chain_network.split("_")

        # fetch wallet address and print balances
        gateway_connections_conf = GatewayConnectionSetting.load()
        if len(gateway_connections_conf) < 1:
            self.notify("No existing wallet.\n")
            return
        wallet = [w for w in gateway_connections_conf if w["chain"] == chain and w["connector"] == connector and w["network"] == network]
        address = wallet[0]['wallet_address']
        self.logger().info(f"Trading options using wallet address: {address}...")


        self.logger().info(f"Checking getCollateralToken0...")
        self.logger().info(f"POST /options/getCollateralToken0 [ connector: {connector} ]")
        request_payload = {
            "chain": chain,
            "network": network,
            "connector": connector,
            "address": address,
        } 
        colatteralTracker0 = await GatewayHttpClient.get_instance().api_request(
            method="post",
            path_url="options/getCollateralToken0",
            params=request_payload,
            fail_silently=False
        )
        self.logger().info(f"CollateralTracker contract address for token0: {colatteralTracker0}")

        colatteralTracker1 = await GatewayHttpClient.get_instance().api_request(
            method="post",
            path_url="options/getCollateralToken1",
            params=request_payload,
            fail_silently=False
        )
        self.logger().info(f"CollateralTracker contract address for token1: {colatteralTracker1}")

        request_payload["collateralTracker"] = colatteralTracker0
        assetToken0 = await GatewayHttpClient.get_instance().api_request(
            method="post",
            path_url="options/getAsset",
            params=request_payload,
            fail_silently=False
        )
        self.logger().info(f"Asset contract address for token0: {assetToken0}")

        request_payload["collateralTracker"] = colatteralTracker0
        self.logger().info(f"Checking withdrawal limit for token0...")
        self.logger().info(f"POST /options/maxWithdraw [ connector: {connector} ]")
        maxWithdraw = await GatewayHttpClient.get_instance().api_request(
            method="post",
            path_url="options/maxWithdraw",
            params=request_payload,
            fail_silently=False
        )

        request_payload["collateralTracker"] = colatteralTracker1
        self.logger().info(f"Checking withdrawal limit for token1...")
        self.logger().info(f"POST /options/maxWithdraw [ connector: {connector} ]")
        maxWithdraw = await GatewayHttpClient.get_instance().api_request(
            method="post",
            path_url="options/maxWithdraw",
            params=request_payload,
            fail_silently=False
        )

        self.logger().info(f"Checking numberOfPositions...")
        self.logger().info(f"POST /options/numberOfPositions [ connector: {connector} ]")
        numberOfPositions = await GatewayHttpClient.get_instance().api_request(
            method="post",
            path_url="options/numberOfPositions",
            params=request_payload,
            fail_silently=False
        )
        self.logger().info(f"numberOfPositions: {int(numberOfPositions['hex'], 16)}")

        self.logger().info(f"Checking queryOpenPositions...")
        self.logger().info(f"POST /options/queryOpenPositions [ connector: {connector} ]")
        openPositions = await GatewayHttpClient.get_instance().api_request(
            method="post",
            path_url="options/queryOpenPositions",
            params=request_payload,
            fail_silently=False
        )
        self.logger().info(f"queryOpenPositions: {openPositions}")

        request_payload["collateralTracker"] = colatteralTracker0
        self.logger().info(f"Checking getPoolData...")
        self.logger().info(f"POST /options/getPoolData [ connector: {connector} ]")
        data = await GatewayHttpClient.get_instance().api_request(
            method="post",
            path_url="options/getPoolData",
            params=request_payload,
            fail_silently=False
        )
        poolAssets = data['poolAssets']['hex']
        insideAMM = data['insideAMM']['hex']
        currentPoolUtilization = data['currentPoolUtilization']['hex']
        self.logger().info(f"getPoolData...")
        self.logger().info(f"... poolAssets: {poolAssets}")
        self.logger().info(f"... insideAMM: {insideAMM}")
        self.logger().info(f"... currentPoolUtilization: {currentPoolUtilization}")

        self.logger().info(f"Checking pokeMedian...")
        self.logger().info(f"POST /options/pokeMedian [ connector: {connector} ]")
        response = await GatewayHttpClient.get_instance().api_request(
            method="post",
            path_url="options/pokeMedian",
            params=request_payload,
            fail_silently=False
        )
        self.logger().info(f"pokeMedian: {response}")

        # self.logger().info(f"Querying greeks...")
        # self.logger().info(f"POST /options/queryGreeks [ connector: {connector} ]")
        # request_payload["tick"] = 1
        # request_payload["greek"] = "delta"
        # delta = await GatewayHttpClient.get_instance().api_request(
        #     method="post",
        #     path_url="options/queryGreeks",
        #     params=request_payload,
        #     fail_silently=False
        # )
        # request_payload["greek"] = "gamma"
        # delta = await GatewayHttpClient.get_instance().api_request(
        #     method="post",
        #     path_url="options/queryGreeks",
        #     params=request_payload,
        #     fail_silently=False
        # )
        # self.logger().info(f"Delta: {delta}")
        # self.logger().info(f"Gamma: {gamma}")


        # self.logger().info(f"MAKING DEPOSIT...")
        # request_payload["assets"] = str(int(np.power(10, 30)))
        # depositToken0 = await GatewayHttpClient.get_instance().api_request(
        #     method="post",
        #     path_url="options/deposit",
        #     params=request_payload,
        #     fail_silently=False
        # )


        self.logger().info("End of trade strategy...")
