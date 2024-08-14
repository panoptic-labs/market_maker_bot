import {
  BurnRequest,
  BurnResponse,
  MintRequest,
  MintResponse,
} from './options.requests';
import {
  mint as panopticMint,
  burn as panopticBurn,
  getCollateralToken0 as panopticGetCollateralToken0,
  getCollateralToken1 as panopticGetCollateralToken1,
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

export async function getCollateralToken0(req: any): Promise<any> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);

  const connector: Panoptic =
    await getConnector<Panoptic>(
      req.chain,
      req.network,
      req.connector
    );

  if (connector instanceof Panoptic) {
    return panopticGetCollateralToken0(<Ethereumish>chain, connector, req);
  } 
}

export async function getCollateralToken1(req: any): Promise<any> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);

  const connector: Panoptic =
    await getConnector<Panoptic>(
      req.chain,
      req.network,
      req.connector
    );

  if (connector instanceof Panoptic) {
    return panopticGetCollateralToken1(<Ethereumish>chain, connector, req);
  } 
}

