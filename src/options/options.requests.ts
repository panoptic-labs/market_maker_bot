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
  finalAmountReceived?: string; // Cosmos
  rawAmount: string;
  finalAmountReceived_basetoken?: string; // Cosmos
  expectedIn?: string;
  expectedOut?: string;  // Cosmos: expectedAmountReceived
  expectedPrice?: string;  // Cosmos
  price: string; // Cosmos: finalPrice
  gasPrice: number;
  gasPriceToken: string;
  gasLimit: number;
  gasWanted?: string; // Cosmos
  gasCost: string; // Cosmos: gasUsed
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
  finalAmountReceived?: string; // Cosmos
  rawAmount: string;
  finalAmountReceived_basetoken?: string; // Cosmos
  expectedIn?: string;
  expectedOut?: string;  // Cosmos: expectedAmountReceived
  expectedPrice?: string;  // Cosmos
  price: string; // Cosmos: finalPrice
  gasPrice: number;
  gasPriceToken: string;
  gasLimit: number;
  gasWanted?: string; // Cosmos
  gasCost: string; // Cosmos: gasUsed
  nonce?: number;
  txHash: string | any | undefined;
}
