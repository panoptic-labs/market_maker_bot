import {
  NetworkSelectionRequest,
} from '../services/common-interfaces';
import { BigNumber, Wallet } from 'ethers';

export interface PanopticRequest{
  network?: string; 
  chain?: string; 
  connector?: string; 
  address?: string; 
}

export interface CalculateDeltaRequest extends PanopticRequest{
  STRIKE: number;
  RANGE: number;
  PRICE: number;
}

export interface CalculateGammaRequest extends PanopticRequest{
  STRIKE: number;
  RANGE: number;
  PRICE: number;
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

export interface GreekQueryRequest extends PanopticRequest{
  address: string; 
  STRIKE: number;
  RANGE: number;
  PRICE: number;
  string: string;
  tick: number;
  positionIdList: BigNumber[];
  greek: string; 
}

export interface QueryOpenPositionsRequest extends PanopticRequest{
  wallet: Wallet; 
  address: string;
} 

export interface QuerySubgraphRequest extends PanopticRequest{
  query: string;
  variables: any; 
}

export interface CalculateAccumulatedFeesBatchRequest extends PanopticRequest{
  wallet: Wallet;
  includePendingPremium: boolean;
  positionIdList: BigNumber[];
  address: string;
}

export interface CollateralToken0Request extends PanopticRequest{
  wallet: Wallet;
  address: string;
}

export interface CollateralToken1Request extends PanopticRequest{
  wallet: Wallet;
  address: string;
}

// export interface ExecuteBurnRequest extends PanopticRequest{
//   wallet: Wallet;
//   burnTokenId: BigNumber;
//   newPositionIdList: BigNumber[];
//   tickLimitLow: number;
//   tickLimitHigh: number;
// }

export interface ForceExerciseRequest extends PanopticRequest{
  wallet: Wallet;
  touchedId: BigNumber[];
  positionIdListExercisee: BigNumber[];
  positionIdListExercisor: BigNumber[];
  address: string;
}

export interface LiquidateRequest extends PanopticRequest{
  wallet: Wallet;
  positionIdListLiquidator: BigNumber[];
  liquidatee: BigNumber;
  delegations: number;
  positionIdList: BigNumber[];
  address: string;
}

export interface ExecuteMintRequest extends NetworkSelectionRequest {
  address: string;
  positionIdList: BigNumber[];
  positionSize: BigNumber;
  effectiveLiquidityLimit: BigNumber;
  panopticPool: string;
}

export interface NumberOfPositionsRequest extends PanopticRequest{  
  wallet: Wallet; 
  address: string;
} 

export interface OptionPositionBalanceRequest extends PanopticRequest{
  wallet: Wallet;
  tokenId: BigNumber;
  address: string;
}

export interface PokeMedianRequest extends PanopticRequest{
  wallet: Wallet;
  address: string;
}

export interface SettleLongPremiumRequest extends PanopticRequest{
  wallet: Wallet;
  positionIdList: BigNumber[];
  owner: BigNumber;
  legIndex: BigNumber;
  address: string;
}

export interface DepositRequest extends PanopticRequest{
  wallet: Wallet;
  collateralTracker: any;
  assets: BigNumber; 
  address: string;
}

export interface GetAssetRequest extends PanopticRequest{
  wallet: Wallet;
  collateralTracker: any;
  address: string;
}

export interface GetPoolDataRequest extends PanopticRequest{
  wallet: Wallet;
  collateralTracker: any;
  address: string;
}

export interface MaxWithdrawRequest extends PanopticRequest{
  wallet: Wallet;
  collateralTracker: any;
  address: string;
}

export interface WithdrawRequest extends PanopticRequest{
  wallet: Wallet;
  collateralTracker: any;
  assets: BigNumber;
  address: string;
}

export interface GetAccountLiquidityRequest extends PanopticRequest{
  wallet: Wallet; 
  univ3pool: BigNumber;
  owner: BigNumber;
  tokenType: BigNumber;
  tickLower: number;
  tickUpper: number;
  address: string;
}

export interface GetAccountPremiumRequest extends PanopticRequest{
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

export interface GetAccountFeesBaseRequest extends PanopticRequest{
  wallet: Wallet;
  univ3pool: BigNumber;
  owner: BigNumber;
  tokenType: BigNumber;
  tickLower: number;
  tickUpper: number;
  address: string;
}

export interface BurnResponse {
  network: string;
  timestamp: number;
  latency: number;
  base: string;
  quote: string;
  amount: string; // traderequest.amount
  finalAmountReceived?: string; // 
  rawAmount: string;
  finalAmountReceived_basetoken?: string; // 
  expectedIn?: string;
  expectedOut?: string;  // : expectedAmountReceived
  expectedPrice?: string;  // 
  price: string; // : finalPrice
  gasPrice: number;
  gasPriceToken: string;
  gasLimit: number;
  gasWanted?: string; // 
  gasCost: string; // : gasUsed
  nonce?: number;
  txHash: string | any | undefined;
}

export interface MintResponse {
  network: string;
  timestamp: number;
  latency: number;
  base: string;
  quote: string;
  amount: string; // traderequest.amount
  finalAmountReceived?: string; // 
  rawAmount: string;
  finalAmountReceived_basetoken?: string; // 
  expectedIn?: string;
  expectedOut?: string;  // : expectedAmountReceived
  expectedPrice?: string;  // 
  price: string; // : finalPrice
  gasPrice: number;
  gasPriceToken: string;
  gasLimit: number;
  gasWanted?: string; // 
  gasCost: string; // : gasUsed
  nonce?: number;
  txHash: string | any | undefined;
}

export interface EstimateGasResponse {
  network: string;
  timestamp: number;
  gasPrice: number;
  gasPriceToken: string;
  gasLimit: number;
  gasCost: string;
}
