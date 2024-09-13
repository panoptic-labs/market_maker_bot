import {
  ExecuteBurnRequest,
  BurnResponse,
  CalculateDeltaRequest,
  CalculateDeltaResponse,
  // CalculateGammaRequest,
  // CalculateGammaResponse,
  // GreekQueryRequest,
  // GreekQueryResponse,
  QueryPositionsRequest,
  QueryPositionsResponse,
  // QuerySubgraphRequest,
  // QuerySubgraphResponse,
  // CreateBigLizardRequest,
  // CreateCallCalendarSpreadRequest,
  // CreateCallDiagonalSpreadRequest,
  // CreateCallRatioSpreadRequest,
  // CreateCallSpreadRequest,
  // CreateCallZEBRASpreadRequest,
  // CreateIronButterflyRequest,
  // CreateIronCondorRequest,
  // CreateJadeLizardRequest,
  // CreatePutCalendarSpreadRequest,
  // CreatePutDiagonalSpreadRequest, 
  // CreatePutRatioSpreadRequest,
  // CreatePutSpreadRequest,
  // CreatePutZEBRASpreadRequest,
  // CreateStraddleRequest,
  // CreateStrangleRequest,
  // CreateSuperBearRequest,
  // CreateSuperBullRequest,
  // CreateZEEHBSRequest,
  // CreateAddLegsRequest,
  // CreatePositionResponse,
  // CalculateAccumulatedFeesBatchRequest,
  // CalculateAccumulatedFeesBatchResponse,
  // CollateralTokenRequest,
  // CollateralTokenResponse,
  // ForceExerciseRequest,
  // ForceExerciseResponse,
  // LiquidateRequest,
  // LiquidateResponse,
  ExecuteMintRequest,
  MintResponse,
  // NumberOfPositionsRequest,
  // NumberOfPositionsResponse,
  // OptionPositionBalanceRequest,
  // PokeMedianRequest,
  // SettleLongPremiumRequest,
  // DepositRequest,
  // DepositResponse,
  // GetAssetRequest,
  // GetAssetResponse,
  // GetPoolDataRequest,
  // MaxWithdrawRequest,
  // WithdrawRequest,
  // GetAccountLiquidityRequest,
  // GetAccountPremiumRequest,
  // GetAccountFeesBaseRequest,
  // EstimateGasResponse,
  // OptionsPositionBalanceResponse,
  // PokeMedianResponse,
  // SettleLongPremiumResponse,
  // GetPoolDataResponse,
  // MaxWithdrawResponse,
  // WithdrawResponse,
  // GetAccountLiquidityResponse,
  // GetAccountPremiumResponse,
  // GetAccountFeesBaseResponse
} from './options.requests';
import {
  addLeg as panopticAddLeg,
  mint as panopticMint,
  burn as panopticBurn,
  forceExercise as panopticForceExercise,
  liquidate as panopticLiquidate,
  getCollateralToken0 as panopticGetCollateralToken0,
  getCollateralToken1 as panopticGetCollateralToken1,
  getAsset as panopticGetAsset,
  deposit as panopticDeposit,
  withdraw as panopticWithdraw,
  getPoolData as panopticGetPoolData,
  maxWithdraw as panopticMaxWithdraw,
  numberOfPositions as panopticNumberOfPositions,
  querySubgraph as panopticQuerySubgraph,
  createBigLizard as panopticCreateBigLizard,
  createCallCalendarSpread as panopticCreateCallCalendarSpread,
  createCallDiagonalSpread as panopticCreateCallDiagonalSpread,
  createCallRatioSpread as panopticCreateCallRatioSpread,
  createCallSpread as panopticCreateCallSpread,
  createCallZEBRASpread as panopticCreateCallZEBRASpread,
  createIronButterfly as panopticCreateIronButterfly,
  createIronCondor as panopticCreateIronCondor,
  createJadeLizard as panopticCreateJadeLizard,
  createPutCalendarSpread as panopticCreatePutCalendarSpread,
  createPutDiagonalSpread as panopticCreatePutDiagonalSpread,
  createPutRatioSpread as panopticCreatePutRatioSpread,
  createPutSpread as panopticCreatePutSpread,
  createPutZEBRASpread as panopticCreatePutZEBRASpread,
  createStraddle as panopticCreateStraddle,
  createStrangle as panopticCreateStrangle,
  createSuperBear as panopticCreateSuperBear,
  createSuperBull as panopticCreateSuperBull,
  createZEEHBS as panopticCreateZEEHBS,
  queryPositions as panopticQueryPositions,
  queryGreeks as panopticQueryGreeks,
  calculateAccumulatedFeesBatch as panopticCalculateAccumulatedFeesBatch,
  optionPositionBalance as panopticOptionPositionBalance,
  pokeMedian as panopticPokeMedian,
  settleLongPremium as panopticSettleLongPremium,
  getAccountLiquidity as panopticGetAccountLiquidity,
  getAccountPremium as panopticGetAccountPremium,
  getAccountFeesBase as panopticGetAccountFeesBase,
  calculateDelta as panopticCalculateDelta,
  calculateGamma as panopticCalculateGamma,
} from '../connectors/panoptic/panoptic.controllers';
import {
  getInitializedChain,
  getConnector,
} from '../services/connection-manager';
import {
  Chain as Ethereumish,
} from '../services/common-interfaces';
import { Panoptic } from '../connectors/panoptic/panoptic';

export async function calculateDelta(req: CalculateDeltaRequest): Promise<CalculateDeltaResponse | Error> {
  const connector: Panoptic =
    await getConnector<Panoptic>(
      req.chain,
      req.network,
      req.connector
    );
  if (connector instanceof Panoptic) {
    return panopticCalculateDelta(connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function calculateGamma(req: any): Promise<any> {
  const connector: Panoptic =
    await getConnector<Panoptic>(
      req.chain,
      req.network,
      req.connector
    );
  if (connector instanceof Panoptic) {
    return panopticCalculateGamma(connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
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
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function queryPositions(req: QueryPositionsRequest): Promise<QueryPositionsResponse | Error> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic =
    await getConnector<Panoptic>(
      req.chain,
      req.network,
      req.connector
    );
  if (connector instanceof Panoptic) {
    return panopticQueryPositions(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
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
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function createBigLizard(req: any): Promise<any> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic =
    await getConnector<Panoptic>(
      req.chain,
      req.network,
      req.connector
    );
  if (connector instanceof Panoptic) {
    return panopticCreateBigLizard(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function createCallCalendarSpread(req: any): Promise<any> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic =
    await getConnector<Panoptic>(
      req.chain,
      req.network,
      req.connector
    );
  if (connector instanceof Panoptic) {
    return panopticCreateCallCalendarSpread(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function createCallDiagonalSpread(req: any): Promise<any> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic =
    await getConnector<Panoptic>(
      req.chain, req.network, req.connector
    );
  if (connector instanceof Panoptic) {
    return panopticCreateCallDiagonalSpread(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function createCallRatioSpread(req: any): Promise<any> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic = await getConnector<Panoptic>(req.chain, req.network, req.connector);
  if (connector instanceof Panoptic) {
    return panopticCreateCallRatioSpread(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function createCallSpread(req: any): Promise<any> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic = await getConnector<Panoptic>(req.chain, req.network, req.connector);
  if (connector instanceof Panoptic) {
    return panopticCreateCallSpread(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function createCallZEBRASpread(req: any): Promise<any> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic = await getConnector<Panoptic>(req.chain, req.network, req.connector);
  if (connector instanceof Panoptic) {
    return panopticCreateCallZEBRASpread(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function createIronButterfly(req: any): Promise<any> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic = await getConnector<Panoptic>(req.chain, req.network, req.connector);
  if (connector instanceof Panoptic) {
    return panopticCreateIronButterfly(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function createIronCondor(req: any): Promise<any> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic = await getConnector<Panoptic>(req.chain, req.network, req.connector);
  if (connector instanceof Panoptic) {
    return panopticCreateIronCondor(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function createJadeLizard(req: any): Promise<any> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic = await getConnector<Panoptic>(req.chain, req.network, req.connector);
  if (connector instanceof Panoptic) {
    return panopticCreateJadeLizard(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function createPutCalendarSpread(req: any): Promise<any> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic = await getConnector<Panoptic>(req.chain, req.network, req.connector);
  if (connector instanceof Panoptic) {
    return panopticCreatePutCalendarSpread(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function createPutDiagonalSpread(req: any): Promise<any> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic = await getConnector<Panoptic>(req.chain, req.network, req.connector);
  if (connector instanceof Panoptic) {
    return panopticCreatePutDiagonalSpread(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function createPutRatioSpread(req: any): Promise<any> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic = await getConnector<Panoptic>(req.chain, req.network, req.connector);
  if (connector instanceof Panoptic) {
    return panopticCreatePutRatioSpread(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function createPutSpread(req: any): Promise<any> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic = await getConnector<Panoptic>(req.chain, req.network, req.connector);
  if (connector instanceof Panoptic) {
    return panopticCreatePutSpread(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function createPutZEBRASpread(req: any): Promise<any> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic = await getConnector<Panoptic>(req.chain, req.network, req.connector);
  if (connector instanceof Panoptic) {
    return panopticCreatePutZEBRASpread(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function createStraddle(req: any): Promise<any> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic = await getConnector<Panoptic>(req.chain, req.network, req.connector);
  if (connector instanceof Panoptic) {
    return panopticCreateStraddle(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function createStrangle(req: any): Promise<any> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic = await getConnector<Panoptic>(req.chain, req.network, req.connector);
  if (connector instanceof Panoptic) {
    return panopticCreateStrangle(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function createSuperBear(req: any): Promise<any> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic = await getConnector<Panoptic>(req.chain, req.network, req.connector);
  if (connector instanceof Panoptic) {
    return panopticCreateSuperBear(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function createSuperBull(req: any): Promise<any> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic = await getConnector<Panoptic>(req.chain, req.network, req.connector);
  if (connector instanceof Panoptic) {
    return panopticCreateSuperBull(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function createZEEHBS(req: any): Promise<any> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic = await getConnector<Panoptic>(req.chain, req.network, req.connector);
  if (connector instanceof Panoptic) {
    return panopticCreateZEEHBS(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
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
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
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
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
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
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function burn(req: ExecuteBurnRequest): Promise<BurnResponse | Error> {
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
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function forceExercise(req: any): Promise<any> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);

  const connector: Panoptic =
    await getConnector<Panoptic>(
      req.chain,
      req.network,
      req.connector
    );

  if (connector instanceof Panoptic) {
    return panopticForceExercise(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function liquidate(req: any): Promise<any> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);

  const connector: Panoptic =
    await getConnector<Panoptic>(
      req.chain,
      req.network,
      req.connector
    );

  if (connector instanceof Panoptic) {
    return panopticLiquidate(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function mint(req: ExecuteMintRequest): Promise<MintResponse | Error> {
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
    return new Error(`Method undefined on this connector, or no valid connector.`);
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
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function optionPositionBalance(req: any): Promise<any> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic =
    await getConnector<Panoptic>(
      req.chain,
      req.network,
      req.connector
    );
  if (connector instanceof Panoptic) {
    return panopticOptionPositionBalance(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
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
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function settleLongPremium(req: any): Promise<any> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic =
    await getConnector<Panoptic>(
      req.chain,
      req.network,
      req.connector
    );
  if (connector instanceof Panoptic) {
    return panopticSettleLongPremium(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
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
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
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
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
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
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
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
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
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
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function getAccountLiquidity(req: any): Promise<any> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic =
    await getConnector<Panoptic>(
      req.chain,
      req.network,
      req.connector
    );
  if (connector instanceof Panoptic) {
    return panopticGetAccountLiquidity(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function getAccountPremium(req: any): Promise<any> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic =
    await getConnector<Panoptic>(
      req.chain,
      req.network,
      req.connector
    );
  if (connector instanceof Panoptic) {
    return panopticGetAccountPremium(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function getAccountFeesBase(req: any): Promise<any> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic =
    await getConnector<Panoptic>(
      req.chain,
      req.network,
      req.connector
    );
  if (connector instanceof Panoptic) {
    return panopticGetAccountFeesBase(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}

export async function addLeg(req: any): Promise<any> {
  const chain = await getInitializedChain<Ethereumish>(req.chain, req.network);
  const connector: Panoptic =
    await getConnector<Panoptic>(
      req.chain,
      req.network,
      req.connector
    );
  if (connector instanceof Panoptic) {
    return panopticAddLeg(<Ethereumish>chain, connector, req);
  } else {
    return new Error(`Method undefined on this connector, or no valid connector.`);
  }
}