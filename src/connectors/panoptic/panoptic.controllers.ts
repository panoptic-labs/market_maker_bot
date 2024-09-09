import { BigNumber, Wallet } from 'ethers';
import {
  HttpException,
  LOAD_WALLET_ERROR_CODE,
  LOAD_WALLET_ERROR_MESSAGE,
} from '../../services/error-handler';
import {
  Ethereumish,
  ExpectedTrade,
  Tokenish,
} from '../../services/common-interfaces';
import { logger } from '../../services/logger';
import {
  ExecuteBurnRequest,
  BurnResponse,
  CalculateDeltaRequest,
  CalculateDeltaResponse,
  CalculateGammaRequest,
  CalculateGammaResponse,
  GreekQueryRequest,
  GreekQueryResponse,
  QueryOpenPositionsRequest,
  QueryOpenPositionsResponse,
  QuerySubgraphRequest,
  QuerySubgraphResponse,
  CreateBigLizardRequest,
  CreateCallCalendarSpreadRequest,
  CreateCallDiagonalSpreadRequest,
  CreateCallRatioSpreadRequest,
  CreateCallSpreadRequest,
  CreateCallZEBRASpreadRequest,
  CreateIronButterflyRequest,
  CreateIronCondorRequest,
  CreateJadeLizardRequest,
  CreatePutCalendarSpreadRequest,
  CreatePutDiagonalSpreadRequest, 
  CreatePutRatioSpreadRequest,
  CreatePutSpreadRequest,
  CreatePutZEBRASpreadRequest,
  CreateStraddleRequest,
  CreateStrangleRequest,
  CreateSuperBearRequest,
  CreateSuperBullRequest,
  CreateZEEHBSRequest,
  CreateAddLegsRequest,
  CreatePositionResponse,
  CalculateAccumulatedFeesBatchRequest,
  CalculateAccumulatedFeesBatchResponse,
  CollateralTokenRequest,
  CollateralTokenResponse,
  ForceExerciseRequest,
  ForceExerciseResponse,
  LiquidateRequest,
  LiquidateResponse,
  ExecuteMintRequest,
  MintResponse,
  NumberOfPositionsRequest,
  NumberOfPositionsResponse,
  OptionPositionBalanceRequest,
  PokeMedianRequest,
  SettleLongPremiumRequest,
  DepositRequest,
  DepositResponse,
  GetAssetRequest,
  GetAssetResponse,
  GetPoolDataRequest,
  MaxWithdrawRequest,
  WithdrawRequest,
  GetAccountLiquidityRequest,
  GetAccountPremiumRequest,
  GetAccountFeesBaseRequest,
  EstimateGasResponse,
  OptionsPositionBalanceResponse,
  PokeMedianResponse,
  SettleLongPremiumResponse,
  GetPoolDataResponse,
  MaxWithdrawResponse,
  WithdrawResponse,
  GetAccountLiquidityResponse,
  GetAccountPremiumResponse,
  GetAccountFeesBaseResponse
} from '../../options/options.requests';
import { Panoptic } from '../panoptic/panoptic';
import { gasCostInEthString } from '../../services/base';

export interface TradeInfo {
  baseToken: Tokenish;
  quoteToken: Tokenish;
  requestAmount: BigNumber;
  expectedTrade: ExpectedTrade;
}

export async function txWriteData(
  ethereumish: Ethereumish,
  address: string,
  maxFeePerGas?: string,
  maxPriorityFeePerGas?: string
): Promise<{
  wallet: Wallet;
  maxFeePerGasBigNumber: BigNumber | undefined;
  maxPriorityFeePerGasBigNumber: BigNumber | undefined;
}> {
  let maxFeePerGasBigNumber: BigNumber | undefined;
  if (maxFeePerGas) {
    maxFeePerGasBigNumber = BigNumber.from(maxFeePerGas);
  }
  let maxPriorityFeePerGasBigNumber: BigNumber | undefined;
  if (maxPriorityFeePerGas) {
    maxPriorityFeePerGasBigNumber = BigNumber.from(maxPriorityFeePerGas);
  }

  let wallet: Wallet;
  try {
    wallet = await ethereumish.getWallet(address);
  } catch (err) {
    logger.error(`Wallet ${address} not available.`);
    throw new HttpException(
      500,
      LOAD_WALLET_ERROR_MESSAGE + err,
      LOAD_WALLET_ERROR_CODE
    );
  }
  return { wallet, maxFeePerGasBigNumber, maxPriorityFeePerGasBigNumber };
}

// NOTE: Relies on a hard-coded 10M gas limit for every transaction.
// TODO: Replace with actual tx simulation logic.
export async function estimateGas(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
): Promise<EstimateGasResponse> {
  const gasPrice: number = ethereumish.gasPrice;
  const gasLimit: number = panopticish.gasLimitEstimate;
  return {
    network: ethereumish.chain,
    timestamp: Date.now(),
    gasPrice: gasPrice,
    gasPriceToken: ethereumish.nativeTokenSymbol,
    gasLimit: gasLimit,
    gasCost: gasCostInEthString(gasPrice, gasLimit),
  };
}

// TODO: Strongly type the return promises for each of the rest of the gateway methods.

export async function calculateDelta(
  panopticish: Panoptic,
  req: CalculateDeltaRequest
): Promise<CalculateDeltaResponse> {
  const result = await panopticish.calculateDelta(req.PRICE, req.RANGE, req.STRIKE);
  return {
    delta: result
  };
}

export async function calculateGamma(
  panopticish: Panoptic,
  req: CalculateGammaRequest
): Promise<CalculateGammaResponse> {
  const result = await panopticish.calculateGamma(req.PRICE, req.RANGE, req.STRIKE);
  return {
    gamma: result
  };
}

// Subgraph interactions

export async function queryOpenPositions(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: QueryOpenPositionsRequest
): Promise<QueryOpenPositionsResponse> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.queryOpenPositions(wallet);
  return {
    queryResponse: result
  };
}

export async function querySubgraph(
  panopticish: Panoptic,
  req: QuerySubgraphRequest
): Promise<QuerySubgraphResponse> {
  const result = await panopticish.querySubgraph(req.query, req.variables);
  return {
    queryResponse: result.data
  };
}

// PanopticHelper interactions

export async function createBigLizard(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: CreateBigLizardRequest
): Promise<CreatePositionResponse> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.createBigLizard(
    wallet,
    req.univ3pool,
    req.width,
    req.longCallStrike,
    req.straddleStrike,
    req.asset
  );
  return {
    tokenId: result.tokenId
  };
}

export async function createCallCalendarSpread(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: CreateCallCalendarSpreadRequest
): Promise<CreatePositionResponse> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.createCallCalendarSpread(
    wallet,
    req.univ3pool,
    req.widthLong,
    req.widthShort,
    req.strike,
    req.asset,
    req.optionRatio, 
    req.start
  );
  return {
    tokenId: result.tokenId
  };
}

export async function createCallDiagonalSpread(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: CreateCallDiagonalSpreadRequest
): Promise<CreatePositionResponse> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.createCallDiagonalSpread(
    wallet,
    req.univ3pool,
    req.widthLong,
    req.widthShort,
    req.strikeLong,
    req.strikeShort,
    req.asset,
    req.optionRatio, 
    req.start
  );
  return {
    tokenId: result.tokenId
  };
}

export async function createCallRatioSpread(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: CreateCallRatioSpreadRequest
): Promise<CreatePositionResponse> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.createCallRatioSpread(
    wallet,
    req.univ3pool,
    req.width,
    req.longStrike,
    req.shortStrike,
    req.asset,
    req.ratio, 
    req.start
  );
  return {
    tokenId: result.tokenId
  };
}

export async function createCallSpread(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: CreateCallSpreadRequest
): Promise<CreatePositionResponse> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.createCallSpread(
    wallet,
    req.univ3pool,
    req.width,
    req.strikeLong,
    req.strikeShort, 
    req.asset,
    req.optionRatio,
    req.start
  );
  return {
    tokenId: result.tokenId
  };
}

export async function createCallZEBRASpread(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: CreateCallZEBRASpreadRequest
): Promise<CreatePositionResponse> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.createCallZEBRASpread(
    wallet,
    req.univ3pool, 
    req.width, 
    req.longStrike, 
    req.shortStrike, 
    req.asset,
    req.ratio, 
    req.start
  );
  return {
    tokenId: result.tokenId
  };
}

export async function createIronButterfly(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: CreateIronButterflyRequest
): Promise<CreatePositionResponse> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.createIronButterfly(
    wallet,
    req.univ3pool, 
    req.width, 
    req.strike, 
    req.wingWidth, 
    req.asset
  );
  return {
    tokenId: result.tokenId
  };
}

export async function createIronCondor(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: CreateIronCondorRequest
): Promise<CreatePositionResponse> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.createIronCondor(
    wallet,
    req.univ3pool, 
    req.width, 
    req.callStrike, 
    req.putStrike, 
    req.wingWidth,
    req.asset
  );
  return {
    tokenId: result.tokenId
  };
}

export async function createJadeLizard(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: CreateJadeLizardRequest
): Promise<CreatePositionResponse> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.createJadeLizard(
    wallet,
    req.univ3pool, 
    req.width, 
    req.longCallStrike, 
    req.shortCallStrike, 
    req.shortPutStrike,
    req.asset
  );
  return {
    tokenId: result.tokenId
  };
}

export async function createPutCalendarSpread(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: CreatePutCalendarSpreadRequest
): Promise<CreatePositionResponse> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.createPutCalendarSpread(
    wallet,
    req.univ3pool, 
    req.widthLong, 
    req.widthShort, 
    req.strike, 
    req.asset,
    req.optionRatio,
    req.start
  );
  return {
    tokenId: result.tokenId
  };
}

export async function createPutDiagonalSpread(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: CreatePutDiagonalSpreadRequest
): Promise<CreatePositionResponse> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.createPutDiagonalSpread(
    wallet,
    req.univ3pool, 
    req.widthLong, 
    req.widthShort, 
    req.strikeLong, 
    req.strikeShort, 
    req.asset,
    req.optionRatio,
    req.start
  );
  return {
    tokenId: result.tokenId
  };
}

export async function createPutRatioSpread(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: CreatePutRatioSpreadRequest
): Promise<CreatePositionResponse> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.createPutRatioSpread(
    wallet,
    req.univ3pool, 
    req.width, 
    req.longStrike, 
    req.shortStrike, 
    req.asset,
    req.ratio,
    req.start
  );
  return {
    tokenId: result.tokenId
  };
}

export async function createPutSpread(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: CreatePutSpreadRequest
): Promise<CreatePositionResponse> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.createPutSpread(
    wallet,
    req.univ3pool, 
    req.width, 
    req.strikeLong, 
    req.strikeShort, 
    req.asset,
    req.optionRatio,
    req.start
  );
  return {
    tokenId: result.tokenId
  };
}

export async function createPutZEBRASpread(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: CreatePutZEBRASpreadRequest
): Promise<CreatePositionResponse> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.createPutZEBRASpread(
    wallet,
    req.univ3pool, 
    req.width, 
    req.longStrike, 
    req.shortStrike, 
    req.asset,
    req.ratio,
    req.start
  );
  return {
    tokenId: result.tokenId
  };
}

export async function createStraddle(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: CreateStraddleRequest
): Promise<CreatePositionResponse> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.createStraddle(
    wallet,
    req.univ3pool, 
    req.width, 
    req.strike, 
    req.asset, 
    req.isLong,
    req.optionRatio,
    req.start
  );
  return {
    tokenId: result.tokenId
  };
}

export async function createStrangle(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: CreateStrangleRequest
): Promise<CreatePositionResponse> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.createStrangle(
    wallet,
    req.univ3pool, 
    req.width, 
    req.callStrike, 
    req.putStrike, 
    req.asset,
    req.isLong,
    req.optionRatio,
    req.start
  );
  return {
    tokenId: result.tokenId
  };
}

export async function createSuperBear(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: CreateSuperBearRequest
): Promise<CreatePositionResponse> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.createSuperBear(
    wallet,
    req.univ3pool, 
    req.width, 
    req.longPutStrike, 
    req.shortPutStrike, 
    req.shortCallStrike,
    req.asset
  );
  return {
    tokenId: result.tokenId
  };
}

export async function createSuperBull(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: CreateSuperBullRequest
): Promise<CreatePositionResponse> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.createSuperBull(
    wallet,
    req.univ3pool, 
    req.width, 
    req.longCallStrike, 
    req.shortCallStrike, 
    req.shortPutStrike,
    req.asset
  );
  return {
    tokenId: result.tokenId
  };
}

export async function createZEEHBS(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: CreateZEEHBSRequest
): Promise<CreatePositionResponse> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.createZEEHBS(
    wallet,
    req.univ3pool, 
    req.width, 
    req.longStrike, 
    req.shortStrike, 
    req.asset,
    req.ratio
  );
  return {
    tokenId: result.tokenId
  };
}

// TODO: Eventually, we'll allow users to make 1 gateway call to get all 5 greeks, rather than
//       calling calculateDelta, then calculateGamma, etc...
//       NOT YET FUNCTIONAL
export async function queryGreeks(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: GreekQueryRequest
): Promise<GreekQueryResponse> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.queryGreeks(wallet, req.tick, req.positionIdList, req.greek);
  return {
    greek: result
  };
}

// PanopticPool interactions

export async function calculateAccumulatedFeesBatch(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: CalculateAccumulatedFeesBatchRequest
): Promise<CalculateAccumulatedFeesBatchResponse> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.calculateAccumulatedFeesBatch(
    wallet,
    req.includePendingPremium,
    req.positionIdList
  );
  return {
    premium0: result[0],
    premium1: result[1],
    other: result[2]
  };
}

export async function getCollateralToken0(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: CollateralTokenRequest
): Promise<CollateralTokenResponse> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.collateralToken0(wallet);
  return {
    collateralToken: result.collateralToken 
  };
}

export async function getCollateralToken1(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: CollateralTokenRequest
): Promise<CollateralTokenResponse> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.collateralToken1(wallet);
  return {
    collateralToken: result.collateralToken 
  };
}

export async function burn(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: ExecuteBurnRequest
): Promise<BurnResponse> {
  const startTimestamp: number = Date.now();
  const { wallet } = await txWriteData(ethereumish, req.address);
  const gasPrice: number = ethereumish.gasPrice;
  const tx = await panopticish.executeBurn(
    wallet,
    req.burnTokenId,
    req.newPositionIdList,
    req.tickLimitLow,
    req.tickLimitHigh,
  );
  if (tx.hash) {
    await ethereumish.txStorage.saveTx(
      ethereumish.chain,
      ethereumish.chainId,
      tx.hash,
      new Date(),
      ethereumish.gasPrice
    );
  }
  logger.info(
    `Burn has been executed, txHash is ${tx.hash}, nonce is ${tx.nonce}, gasPrice is ${gasPrice}.`
  );
  return {
    network: ethereumish.chain,
    timestamp: startTimestamp,
    nonce: tx.nonce,
    txHash: tx.hash,
  };
}

export async function forceExercise(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: ForceExerciseRequest
): Promise<ForceExerciseResponse> {
  const startTimestamp: number = Date.now();
  const { wallet } = await txWriteData(ethereumish, req.address);
  const gasPrice: number = ethereumish.gasPrice;
  const tx = await panopticish.forceExercise(
    wallet,
    req.touchedId,
    req.positionIdListExercisee,
    req.positionIdListExercisor,
  );
  if (tx.hash) {
    await ethereumish.txStorage.saveTx(
      ethereumish.chain,
      ethereumish.chainId,
      tx.hash,
      new Date(),
      ethereumish.gasPrice
    );
  }
  logger.info(
    `Force exercise has been executed, txHash is ${tx.hash}, nonce is ${tx.nonce}, gasPrice is ${gasPrice}.`
  );
  return {
    network: ethereumish.chain,
    timestamp: startTimestamp,
    nonce: tx.nonce,
    txHash: tx.hash,
    other: tx
  };
}

export async function liquidate(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: LiquidateRequest
): Promise<LiquidateResponse> {
  const startTimestamp: number = Date.now();
  const { wallet } = await txWriteData(ethereumish, req.address);
  const gasPrice: number = ethereumish.gasPrice;
  const tx = await panopticish.liquidate(
    wallet,
    req.positionIdListLiquidator,
    req.liquidatee,
    req.delegations,
    req.positionIdList
  );
  if (tx.hash) {
    await ethereumish.txStorage.saveTx(
      ethereumish.chain,
      ethereumish.chainId,
      tx.hash,
      new Date(),
      ethereumish.gasPrice
    );
  }
  logger.info(
    `Liquidation has been executed, txHash is ${tx.hash}, nonce is ${tx.nonce}, gasPrice is ${gasPrice}.`
  );
  return {
    network: ethereumish.chain,
    timestamp: startTimestamp,
    nonce: tx.nonce,
    txHash: tx.hash,
    other: tx
  };
}

export async function mint(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: ExecuteMintRequest
): Promise<MintResponse> {
  const startTimestamp: number = Date.now();
  const { wallet } = await txWriteData(ethereumish, req.address);
  const gasPrice: number = ethereumish.gasPrice;
  const tx = await panopticish.executeMint(
    wallet,
    req.positionIdList,
    BigNumber.from(req.positionSize),
    req.effectiveLiquidityLimit,
  );
  if (tx.hash) {
    await ethereumish.txStorage.saveTx(
      ethereumish.chain,
      ethereumish.chainId,
      tx.hash,
      new Date(),
      ethereumish.gasPrice
    );
  }
  logger.info(
    `Mint has been executed, tx: ${tx}, txHash is ${tx.hash}, nonce is ${tx.nonce}, gasPrice is ${gasPrice}.`
  );
  return {
    network: ethereumish.chain,
    timestamp: startTimestamp,
    nonce: tx.nonce,
    txHash: tx.hash,
  };
}

export async function numberOfPositions(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: NumberOfPositionsRequest
): Promise<NumberOfPositionsResponse> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const numOfPositions = await panopticish.numberOfPositions(
    wallet
  );
  // TODO: cast this to number/int
  return {
    numberOfPositions: numOfPositions
  }
}

export async function optionPositionBalance(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: OptionPositionBalanceRequest
): Promise<OptionsPositionBalanceResponse> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.optionPositionBalance(
    wallet,
    req.tokenId
  );
  return {
    balance: result.balance,
    poolUtilization0: result.poolUtilization0, 
    poolUtilization1: result.poolUtilization1
  };
}

export async function pokeMedian(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: PokeMedianRequest
): Promise<PokeMedianResponse> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const txData = await panopticish.pokeMedian(wallet); 
  return {
    other: txData
  }
}

export async function settleLongPremium(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: SettleLongPremiumRequest
): Promise<SettleLongPremiumResponse> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const positions = await panopticish.settleLongPremium(
    wallet,
    req.positionIdList,
    req.owner,
    req.legIndex
  );
  return {
    other: positions
  };
}

// CollateralTracker interactions

export async function deposit(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: DepositRequest
): Promise<DepositResponse> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const asset = await panopticish.deposit(
    wallet,
    req.collateralTracker,
    BigNumber.from(req.assets)
  );
  return {
    shares: asset.shares
  }; 
}

export async function getAsset(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: GetAssetRequest
): Promise<GetAssetResponse> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const asset = await panopticish.getAsset(
    wallet,
    req.collateralTracker
  );
  return {
    assetTokenAddress: asset
  }; 
}

export async function getPoolData(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: GetPoolDataRequest
): Promise<GetPoolDataResponse> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.getPoolData(
    wallet,
    req.collateralTracker
  );
  return {
    poolAssets: result.poolAssets,
    insideAMM: result.insideAMM, 
    currentPoolUtilization: result.currentPoolUtilization
  };
}

export async function maxWithdraw(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: MaxWithdrawRequest
): Promise<MaxWithdrawResponse> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.maxWithdraw(
    wallet,
    req.collateralTracker
  );
  return {
    maxAssets: result.maxAssets
  };
}

export async function withdraw(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: WithdrawRequest
): Promise<WithdrawResponse> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const response = await panopticish.withdraw(
    wallet,
    req.collateralTracker,
    BigNumber.from(req.assets)
  );
  return {
    shares: response.shares
  };
}

// SemiFungiblePositionManager interactions

export async function getAccountLiquidity(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: GetAccountLiquidityRequest
): Promise<GetAccountLiquidityResponse> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const result = await panopticish.getAccountLiquidity(
    wallet,
    req.univ3pool,
    req.owner,
    req.tokenType,
    req.tickLower,
    req.tickUpper
  );
  return {
    accountLiquidities: result.accountLiquidities
  };
}

export async function getAccountPremium(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: GetAccountPremiumRequest
): Promise<GetAccountPremiumResponse> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const liquidity = await panopticish.getAccountPremium(
    wallet,
    req.univ3pool,
    req.owner,
    req.tokenType,
    req.tickLower,
    req.tickUpper,
    req.atTick,
    req.isLong
  );
  return {
    other1: liquidity[0], 
    other2: liquidity[1]
  };
}

export async function getAccountFeesBase(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: GetAccountFeesBaseRequest
): Promise<GetAccountFeesBaseResponse> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const response = await panopticish.getAccountFeesBase(
    wallet,
    req.univ3pool,
    req.owner,
    req.tokenType,
    req.tickLower,
    req.tickUpper
  );
  return {
    feesBase0: response.feesBase0, 
    feesBase1: response.feesBase1
  };
}

// TokenIdLibrary interactions

export async function addLeg(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: CreateAddLegsRequest
): Promise<CreatePositionResponse> {
  const { wallet } = await txWriteData(ethereumish, req.address);
  const response = await panopticish.addLeg(
    wallet,
    req.self,
    req.legIndex,
    req.optionRatio, 
    req.asset,
    req.isLong,
    req.tokenType,
    req.riskPartner,
    req.strike,
    req.width
  );
  return {
    tokenId: response.tokenId
  };
}
