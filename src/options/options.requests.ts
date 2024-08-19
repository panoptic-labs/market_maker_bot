import {
  NetworkSelectionRequest,
} from '../services/common-interfaces';
import { BigNumber } from 'ethers';

export interface MintRequest extends NetworkSelectionRequest {
  address: string;
  positionIdList: BigNumber[];
  positionSize: BigNumber;
  effectiveLiquidityLimit: BigNumber;
  panopticPool: string;
}
export interface BurnRequest extends NetworkSelectionRequest {
  address: string;
  burnTokenId: BigNumber;
  newPositionIdList: BigNumber[];
  tickLimitLow: number;
  tickLimitHigh: number;
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
