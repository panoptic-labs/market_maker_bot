import {
  TradeRequest,
  TradeResponse,
} from './options.requests';
import {
  // price as panopticPrice,
  // estimateGas as panopticEstimateGas,
  trade as panopticTrade,
} from '../connectors/panoptic/panoptic.controllers';
// import {
//   // price as refPrice,
//   trade as refTrade,
//   // estimateGas as refEstimateGas,
// } from '../connectors/ref/ref.controllers';
import {
  getInitializedChain,
  getConnector,
} from '../services/connection-manager';
import {
  Chain as Ethereumish,
  // Nearish,
  // NetworkSelectionRequest,
  // Perpish,
  // RefAMMish,
  // Tezosish,
  // Uniswapish,
  // UniswapLPish,
} from '../services/common-interfaces';
import { Panoptic } from '../connectors/panoptic/panoptic';


export async function trade(req: TradeRequest): Promise<TradeResponse> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);

  const connector: Panoptic =
    await getConnector<Panoptic>(
      req.chain,
      req.network,
      req.connector
    );

  if (connector instanceof Panoptic) {
    return panopticTrade(<Ethereumish>chain, connector, req);
  } else {
    return panopticTrade(<Ethereumish>chain, connector, req);
  }
}

