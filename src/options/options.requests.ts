import {
  NetworkSelectionRequest,
} from '../services/common-interfaces';
import { BigNumber } from 'ethers';

export interface TradeRequest extends NetworkSelectionRequest {
  address: string,
  tokenId: string,
  positionSize: BigNumber,
  tickLimitHigh: BigNumber, 
  tickLimitLow: BigNumber, 
  panopticPool: string
}
export interface TradeResponse {
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
