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
  getAsset as panopticGetAsset,
  deposit as panopticDeposit,
  withdraw as panopticWithdraw,
  maxWithdraw as panopticMaxWithdraw,
  numberOfPositions as panopticNumberOfPositions,
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

export async function getAsset(req: any): Promise<any> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);

  const connector: Panoptic =
    await getConnector<Panoptic>(
      req.chain,
      req.network,
      req.connector
    );

  if (connector instanceof Panoptic) {
    return panopticGetAsset(<Ethereumish>chain, connector, req);
  } 
}

export async function deposit(req: any): Promise<any> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  
  const connector: Panoptic =
    await getConnector<Panoptic>(
      req.chain,
      req.network,
      req.connector
    );

  if (connector instanceof Panoptic) {
    return panopticDeposit(<Ethereumish>chain, connector, req);
  } 
}

export async function withdraw(req: any): Promise<any> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  
  const connector: Panoptic =
    await getConnector<Panoptic>(
      req.chain,
      req.network,
      req.connector
    );

  if (connector instanceof Panoptic) {
    return panopticWithdraw(<Ethereumish>chain, connector, req);
  } 
}

export async function maxWithdraw(req: any): Promise<any> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  
  const connector: Panoptic =
    await getConnector<Panoptic>(
      req.chain,
      req.network,
      req.connector
    );

  if (connector instanceof Panoptic) {
    return panopticMaxWithdraw(<Ethereumish>chain, connector, req);
  } 
}

export async function numberOfPositions(req: any): Promise<any> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  
  const connector: Panoptic =
    await getConnector<Panoptic>(
      req.chain,
      req.network,
      req.connector
    );

  if (connector instanceof Panoptic) {
    return panopticNumberOfPositions(<Ethereumish>chain, connector, req);
  } 
}

