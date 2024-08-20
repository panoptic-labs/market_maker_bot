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
  getPoolData as panopticGetPoolData, 
  maxWithdraw as panopticMaxWithdraw,
  numberOfPositions as panopticNumberOfPositions,
  querySubgraph as panopticQuerySubgraph,
  queryOpenPositions as panopticQueryOpenPositions,
  queryGreeks as panopticQueryGreeks,
  calculateAccumulatedFeesBatch as panopticCalculateAccumulatedFeesBatch,
  pokeMedian as panopticPokeMedian,
} from '../connectors/panoptic/panoptic.controllers';
import {
  getInitializedChain,
  getConnector,
} from '../services/connection-manager';
import {
  Chain as Ethereumish,
} from '../services/common-interfaces';
import { Panoptic } from '../connectors/panoptic/panoptic';


export async function mint(req: MintRequest): Promise<MintResponse | undefined> {
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
    return;
  }
}

export async function burn(req: BurnRequest): Promise<BurnResponse | undefined> {
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
    return;
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

export async function getPoolData(req: any): Promise<any> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  
  const connector: Panoptic =
    await getConnector<Panoptic>(
      req.chain,
      req.network,
      req.connector
    );

  if (connector instanceof Panoptic) {
    return panopticGetPoolData(<Ethereumish>chain, connector, req);
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

export async function querySubgraph(req: any): Promise<any> {
  const connector: Panoptic =
    await getConnector<Panoptic>(
      req.chain,
      req.network,
      req.connector
    );
  if (connector instanceof Panoptic) {
    return panopticQuerySubgraph(connector, req);
  } 
}

export async function queryOpenPositions(req: any): Promise<any> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic =
    await getConnector<Panoptic>(
      req.chain,
      req.network,
      req.connector
    );
  if (connector instanceof Panoptic) {
    return panopticQueryOpenPositions(<Ethereumish>chain, connector, req);
  } 
}

export async function queryGreeks(req: any): Promise<any> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic =
    await getConnector<Panoptic>(
      req.chain,
      req.network,
      req.connector
    );
  if (connector instanceof Panoptic) {
    return panopticQueryGreeks(<Ethereumish>chain, connector, req);
  } 
}

export async function calculateAccumulatedFeesBatch(req: any): Promise<any> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic =
    await getConnector<Panoptic>(
      req.chain,
      req.network,
      req.connector
    );
  if (connector instanceof Panoptic) {
    return panopticCalculateAccumulatedFeesBatch(<Ethereumish>chain, connector, req);
  } 
}

export async function pokeMedian(req: any): Promise<any> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic =
    await getConnector<Panoptic>(
      req.chain,
      req.network,
      req.connector
    );
  if (connector instanceof Panoptic) {
    return panopticPokeMedian(<Ethereumish>chain, connector, req);
  } 
}