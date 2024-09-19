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
    trading_pair = {"t0-t1"}
    burnTokenId = "77322919308318248886668502693724"
    newPositionIdList = [
        "1724358520355700724595784863781761016418202439334584929386932255284888270684"
    ]
    tickLimitLow = -887272
    tickLimitHigh = 887272
    markets = {}
    on_going_task = False
    tick_count = 0

    def on_tick(self):
        # only execute once. Remove flag to execute each tick. 
        if not self.on_going_task:
            self.on_going_task = True
            # wrap async task in safe_ensure_future
            safe_ensure_future(self.async_task())
        self.tick_count = self.tick_count + 1
        self.logger().info(f"Tick count: {self.tick_count}")

    # async task since we are using Gateway
    async def async_task(self):
        base, quote = list(self.trading_pair)[0].split("-")
        connector, chain, network = self.connector_chain_network.split("_")

        # fetch wallet address and print balances
        gateway_connections_conf = GatewayConnectionSetting.load()
        if len(gateway_connections_conf) < 1:
            self.notify("No existing wallet.\n")
            return
        wallet = [w for w in gateway_connections_conf if w["chain"] == chain and w["connector"] == connector and w["network"] == network]
        address = wallet[0]['wallet_address']
 
        request_payload = {
            "chain": chain,
            "network": network,
            "connector": connector,
            "address": address,
            "burnTokenId": self.burnTokenId,
            "newPositionIdList": self.newPositionIdList
        } 

        self.logger().info(f"Checking positions...")
        self.logger().info(f"POST /options/queryPositions [ connector: {connector} ]")
        response = await GatewayHttpClient.get_instance().api_request(
            method="post",
            path_url="options/queryPositions",
            params=request_payload,
            fail_silently=False
        )

        self.logger().info(f"All positions: {response['openPositionIdList']}")

        self.logger().info("End of trade strategy...")