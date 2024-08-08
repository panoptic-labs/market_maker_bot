import {
  BurnRequest,
  BurnResponse,
  MintRequest,
  MintResponse,
} from './options.requests';
import {
  mint as panopticMint,
  burn as panopticBurn,
} from '../connectors/panoptic/panoptic.controllers';
import {
  getInitializedChain,
  getConnector,
} from '../services/connection-manager';
import {
  Chain as Ethereumish,
} from '../services/common-interfaces';
import { Panoptic } from '../connectors/panoptic/panoptic';


export async function mint(req: MintRequest): Promise<MintResponse> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);

  const connector: Panoptic =
    await getConnector<Panoptic>(
      req.chain,
      req.network,
      req.connector
    );

  if (connector instanceof Panoptic) {
    return panopticMint(<Ethereumish>chain, connector, req);
  } else {
    return panopticMint(<Ethereumish>chain, connector, req);
  }
}

export async function burn(req: BurnRequest): Promise<BurnResponse> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);

  const connector: Panoptic =
    await getConnector<Panoptic>(
      req.chain,
      req.network,
      req.connector
    );

  if (connector instanceof Panoptic) {
    return panopticBurn(<Ethereumish>chain, connector, req);
  } else {
    return panopticBurn(<Ethereumish>chain, connector, req);
  }
}

