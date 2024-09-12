import {
  NetworkSelectionRequest,
} from '../services/common-interfaces';
import { BigNumber, Wallet } from 'ethers';

export interface PanopticRequest {
  network?: string;
  chain?: string;
  connector?: string;
  address?: string;
}

export interface BroadcastedTxResponse {
  network?: string;
  timestamp?: number;
  nonce?: number;
  txHash?: string | any | undefined;
}

export interface EstimateGasResponse {
  network: string;
  timestamp: number;
  gasPrice: number;
  gasPriceToken: string;
  gasLimit: number;
  gasCost: string;
}
export interface CalculateDeltaRequest extends PanopticRequest {
  STRIKE: number;
  RANGE: number;
  PRICE: number;
}

export interface CalculateDeltaResponse {
  delta: number;
}

export interface CalculateGammaRequest extends PanopticRequest {
  STRIKE: number;
  RANGE: number;
  PRICE: number;
}

export interface CalculateGammaResponse {
  gamma: number;
}

export interface GreekQueryRequest extends PanopticRequest {
  address: string;
  STRIKE: number;
  RANGE: number;
  PRICE: number;
  string: string;
  tick: number;
  positionIdList: BigNumber[];
  greek: string;
}

export interface GreekQueryResponse {
  greek: string;
  address?: string;
  STRIKE?: number;
  RANGE?: number;
  PRICE?: number;
  string?: string;
  tick?: number;
  positionIdList?: BigNumber[];
}

export interface QueryPositionsRequest extends PanopticRequest {
  wallet: Wallet;
  address: string;
}

export interface QueryPositionsResponse extends QuerySubgraphResponse {
  positions?: BigNumber[];
  closedPositionIdList?: BigNumber[];
  openPositionIdList?: BigNumber[];
}

export interface QuerySubgraphRequest extends PanopticRequest {
  query: string;
  variables: any;
}

export interface QuerySubgraphResponse {
  queryResponse: string;
}

export interface CreatePositionRequest {
  wallet: Wallet;
  univ3pool: BigNumber;
  address: string;
}

export interface CreateBigLizardRequest extends CreatePositionRequest {
  width: number;
  longCallStrike: number;
  straddleStrike: number;
  asset: BigNumber;
}

export interface CreateCallCalendarSpreadRequest extends CreatePositionRequest {
  widthLong: number;
  widthShort: number;
  strike: number;
  asset: BigNumber;
  optionRatio: BigNumber;
  start: BigNumber;
}

export interface CreateCallDiagonalSpreadRequest extends CreatePositionRequest {
  widthLong: number;
  widthShort: number;
  strikeLong: number;
  strikeShort: number;
  asset: BigNumber;
  optionRatio: BigNumber;
  start: BigNumber;
}

export interface CreateCallRatioSpreadRequest extends CreatePositionRequest {
  width: number;
  longStrike: number;
  shortStrike: number;
  asset: BigNumber;
  ratio: BigNumber;
  start: BigNumber;
}

export interface CreateCallSpreadRequest extends CreatePositionRequest {
  width: number;
  strikeLong: number;
  strikeShort: number;
  asset: BigNumber;
  optionRatio: BigNumber;
  start: BigNumber;
}

export interface CreateCallZEBRASpreadRequest extends CreatePositionRequest {
  width: number;
  longStrike: number;
  shortStrike: number;
  asset: BigNumber;
  ratio: BigNumber;
  start: BigNumber;
}

export interface CreateIronButterflyRequest extends CreatePositionRequest {
  width: number;
  strike: number;
  wingWidth: number;
  asset: BigNumber;
}

export interface CreateIronCondorRequest extends CreatePositionRequest {
  width: number;
  callStrike: number;
  putStrike: number;
  wingWidth: number;
  asset: BigNumber;
}

export interface CreateJadeLizardRequest extends CreatePositionRequest {
  width: number;
  longCallStrike: number;
  shortCallStrike: number;
  shortPutStrike: number;
  asset: BigNumber;
}

export interface CreatePutCalendarSpreadRequest extends CreatePositionRequest {
  widthLong: number;
  widthShort: number;
  strike: number;
  asset: BigNumber;
  optionRatio: BigNumber;
  start: BigNumber;
}
export interface CreatePutDiagonalSpreadRequest extends CreatePositionRequest {
  widthLong: number;
  widthShort: number;
  strikeLong: number;
  strikeShort: number;
  asset: BigNumber;
  optionRatio: BigNumber;
  start: BigNumber;
}

export interface CreatePutRatioSpreadRequest extends CreatePositionRequest {
  width: number;
  longStrike: number;
  shortStrike: number;
  asset: BigNumber;
  ratio: BigNumber;
  start: BigNumber;
}

export interface CreatePutSpreadRequest extends CreatePositionRequest {
  width: number;
  strikeLong: number;
  strikeShort: number;
  asset: BigNumber;
  optionRatio: BigNumber;
  start: BigNumber;
}

export interface CreatePutZEBRASpreadRequest extends CreatePositionRequest {
  width: number;
  longStrike: number;
  shortStrike: number;
  asset: BigNumber;
  ratio: BigNumber;
  start: BigNumber;
}

export interface CreateStraddleRequest extends CreatePositionRequest {
  width: number;
  strike: number;
  asset: BigNumber;
  isLong: BigNumber;
  optionRatio: BigNumber;
  start: BigNumber;
}

export interface CreateStrangleRequest extends CreatePositionRequest {
  width: number;
  callStrike: number;
  putStrike: number;
  asset: BigNumber;
  isLong: BigNumber;
  optionRatio: BigNumber;
  start: BigNumber;
}
export interface CreateSuperBearRequest extends CreatePositionRequest {
  width: number;
  longPutStrike: number;
  shortPutStrike: number;
  shortCallStrike: number;
  asset: BigNumber;
}

export interface CreateSuperBullRequest extends CreatePositionRequest {
  width: number;
  longCallStrike: number;
  shortCallStrike: number;
  shortPutStrike: number;
  asset: BigNumber;
}

export interface CreateZEEHBSRequest extends CreatePositionRequest {
  width: number;
  longStrike: number;
  shortStrike: number;
  asset: BigNumber;
  ratio: BigNumber;
}

export interface CreateAddLegsRequest extends CreatePositionRequest {
  self: BigNumber;
  legIndex: BigNumber;
  optionRatio: BigNumber;
  asset: BigNumber;
  isLong: BigNumber;
  tokenType: BigNumber;
  riskPartner: BigNumber;
  strike: number;
  width: number;
}

export interface CreatePositionResponse {
  tokenId: BigNumber;
}

export interface CalculateAccumulatedFeesBatchRequest extends PanopticRequest {
  wallet: Wallet;
  includePendingPremium: boolean;
  positionIdList: BigNumber[];
  address: string;
}

export interface CalculateAccumulatedFeesBatchResponse {
  premium0: BigNumber;
  premium1: BigNumber;
  other: BigNumber;
}

export interface ExecuteBurnRequest extends PanopticRequest {
  address: string;
  chain: string;
  network: string;
  burnTokenId: BigNumber;
  newPositionIdList: BigNumber[];
  tickLimitLow: number;
  tickLimitHigh: number;
}

export interface CollateralTokenRequest extends PanopticRequest {
  wallet: Wallet;
  address: string;
}

export interface CollateralTokenResponse {
  collateralToken: string;
}

export interface ForceExerciseRequest extends PanopticRequest {
  wallet: Wallet;
  touchedId: BigNumber[];
  positionIdListExercisee: BigNumber[];
  positionIdListExercisor: BigNumber[];
  address: string;
}

export interface ForceExerciseResponse extends BroadcastedTxResponse{
  tx: any;
}

export interface LiquidateRequest extends PanopticRequest {
  wallet: Wallet;
  positionIdListLiquidator: BigNumber[];
  liquidatee: BigNumber;
  delegations: number;
  positionIdList: BigNumber[];
  address: string;
}

export interface LiquidateResponse extends BroadcastedTxResponse{
  tx: any; 
}

export interface ExecuteMintRequest extends NetworkSelectionRequest {
  address: string;
  positionIdList: BigNumber[];
  positionSize: BigNumber;
  effectiveLiquidityLimit: BigNumber;
  panopticPool: string;
}

export interface NumberOfPositionsRequest extends PanopticRequest {
  wallet: Wallet;
  address: string;
}

export interface NumberOfPositionsResponse {
  numberOfPositions: BigNumber;
}

export interface OptionPositionBalanceRequest extends PanopticRequest {
  wallet: Wallet;
  tokenId: BigNumber;
  address: string;
}

export interface OptionsPositionBalanceResponse {
  balance: BigNumber;
  poolUtilization0: BigNumber;
  poolUtilization1: BigNumber;
}

export interface PokeMedianRequest extends PanopticRequest {
  address: string;
}

export interface PokeMedianResponse {
  tx?: any; 
}

export interface SettleLongPremiumRequest extends PanopticRequest {
  wallet: Wallet;
  positionIdList: BigNumber[];
  owner: BigNumber;
  legIndex: BigNumber;
  address: string;
}

export interface SettleLongPremiumResponse {
  tx?: any; 
}

export interface DepositRequest extends PanopticRequest {
  wallet: Wallet;
  collateralTracker: any;
  assets: BigNumber;
  address: string;
}

export interface DepositResponse{
  sharesReceived: BigNumber
}

export interface GetAssetRequest extends PanopticRequest {
  wallet: Wallet;
  collateralTracker: any;
  address: string;
}

export interface GetAssetResponse {
  assetTokenAddress: string; 
}

export interface GetPoolDataRequest extends PanopticRequest {
  wallet: Wallet;
  collateralTracker: any;
  address: string;
}

export interface GetPoolDataResponse {
  poolAssets: BigNumber;
  insideAMM: BigNumber;
  currentPoolUtilization: BigNumber; 
}

export interface MaxWithdrawRequest extends PanopticRequest {
  wallet: Wallet;
  collateralTracker: any;
  address: string;
}

export interface MaxWithdrawResponse {
  maxAssets: BigNumber
}

export interface WithdrawRequest extends PanopticRequest {
  wallet: Wallet;
  collateralTracker: any;
  assets: BigNumber;
  address: string;
}

export interface WithdrawResponse {
  shares: BigNumber
}

export interface GetAccountLiquidityRequest extends PanopticRequest {
  wallet: Wallet;
  univ3pool: BigNumber;
  owner: BigNumber;
  tokenType: BigNumber;
  tickLower: number;
  tickUpper: number;
  address: string;
}

export interface GetAccountLiquidityResponse {
  accountLiquidities: BigNumber;
}

export interface GetAccountPremiumRequest extends PanopticRequest {
  wallet: Wallet;
  univ3pool: BigNumber;
  owner: BigNumber;
  tokenType: BigNumber;
  tickLower: number;
  tickUpper: number;
  atTick: number;
  isLong: BigNumber;
  address: string;
}

export interface GetAccountPremiumResponse {
  other1: BigNumber; 
  other2: BigNumber; 
}

export interface GetAccountFeesBaseRequest extends PanopticRequest {
  wallet: Wallet;
  univ3pool: BigNumber;
  owner: BigNumber;
  tokenType: BigNumber;
  tickLower: number;
  tickUpper: number;
  address: string;
}

export interface GetAccountFeesBaseResponse { 
  feesBase0: BigNumber; 
  feesBase1: BigNumber; 
}

export interface BurnResponse {
  network?: string;
  timestamp?: number;
  latency?: number;
  base?: string;
  quote?: string;
  amount?: string; // traderequest.amount
  finalAmountReceived?: string; //
  rawAmount?: string;
  finalAmountReceived_basetoken?: string; //
  expectedIn?: string;
  expectedOut?: string;  // : expectedAmountReceived
  expectedPrice?: string;  //
  price?: string; // : finalPrice
  gasPrice?: number;
  gasPriceToken?: string;
  gasLimit?: number;
  gasWanted?: string; //
  gasCost?: string; // : gasUsed
  nonce?: number;
  txHash?: string | any | undefined;
  other?: any
}

export interface MintResponse extends BroadcastedTxResponse{
  latency?: number;
  base?: string;
  quote?: string;
  amount?: string; // traderequest.amount
  finalAmountReceived?: string; //
  rawAmount?: string;
  finalAmountReceived_basetoken?: string; //
  expectedIn?: string;
  expectedOut?: string;  // : expectedAmountReceived
  expectedPrice?: string;  //
  price?: string; // : finalPrice
  gasPrice?: number;
  gasPriceToken?: string;
  gasLimit?: number;
  gasWanted?: string; //
  gasCost?: string; // : gasUsed
  other?: any 
}


