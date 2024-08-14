import asyncio

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
        self.logger().info(f"Trading options using wallet address: {address}")
        self.logger().info(f"Proceeding to check token collateral on Panoptic Pool...")
        self.logger().info(f"POST /options/getCollateralToken0 [ connector: {connector} ]")
        request_payload = {
            "chain": chain,
            "network": network,
            "connector": connector,
            "address": address,
        } 
    
        data0 = await GatewayHttpClient.get_instance().api_request(
            method="post",
            path_url="options/getCollateralToken0",
            params=request_payload,
            fail_silently=False
        )
        self.logger().info(f"api_request submitted for collateralToken0 ... tradeData: {data0}")
        
        data1 = await GatewayHttpClient.get_instance().api_request(
            method="post",
            path_url="options/getCollateralToken1",
            params=request_payload,
            fail_silently=False
        )
        self.logger().info(f"api_request submitted for collateralToken1 ... tradeData: {data1}")

        # poll for swap result and print resulting balances
        # await self.poll_transaction(chain, network, data['txHash'])
        # await self.get_balance(chain, network, address, base, quote)

        self.logger().info("End of trade strategy...")

