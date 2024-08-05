// import Decimal from 'decimal.js-light';
import { BigNumber, Wallet } from 'ethers';
import {
  HttpException,
  LOAD_WALLET_ERROR_CODE,
  LOAD_WALLET_ERROR_MESSAGE,
  // TRADE_FAILED_ERROR_CODE,
  // TRADE_FAILED_ERROR_MESSAGE,
  // SWAP_PRICE_EXCEEDS_LIMIT_PRICE_ERROR_CODE,
  // SWAP_PRICE_EXCEEDS_LIMIT_PRICE_ERROR_MESSAGE,
  // SWAP_PRICE_LOWER_THAN_LIMIT_PRICE_ERROR_CODE,
  // SWAP_PRICE_LOWER_THAN_LIMIT_PRICE_ERROR_MESSAGE,
  // UNKNOWN_ERROR_ERROR_CODE,
  // UNKNOWN_ERROR_MESSAGE,
} from '../../services/error-handler';
// import { latency, gasCostInEthString } from '../../services/base';
import {
  Ethereumish,
  ExpectedTrade,
  // Uniswapish,
  // UniswapLPish,
  Tokenish,
  // Fractionish,
} from '../../services/common-interfaces';
import { logger } from '../../services/logger';
import {
  TradeRequest,
  // TradeResponse,
} from '../../options/options.requests';
import { Panoptic } from '../panoptic/panoptic';
import panopticPoolAbi from './panoptic_panopticpool_abi.json';

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

export async function trade(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: TradeRequest
): Promise<any> {
  const startTimestamp: number = Date.now();

  const { wallet } =
    await txWriteData(
      ethereumish,
      req.address,
      // req.maxFeePerGas,
      // req.maxPriorityFeePerGas
    );

  // let tradeInfo: TradeInfo;
  // try {
  //   tradeInfo = await getTradeInfo(
  //     ethereumish,
  //     uniswapish,
  //     req.base,
  //     req.quote,
  //     new Decimal(req.amount),
  //     req.side
  //   );
  // } catch (e) {
  //   if (e instanceof Error) {
  //     logger.error(`Could not get trade info. ${e.message}`);
  //     throw new HttpException(
  //       500,
  //       TRADE_FAILED_ERROR_MESSAGE + e.message,
  //       TRADE_FAILED_ERROR_CODE
  //     );
  //   } else {
  //     logger.error('Unknown error trying to get trade info.');
  //     throw new HttpException(
  //       500,
  //       UNKNOWN_ERROR_MESSAGE,
  //       UNKNOWN_ERROR_ERROR_CODE
  //     );
  //   }
  // }

  const gasPrice: number = ethereumish.gasPrice;
  // const gasLimitTransaction: number = ethereumish.gasLimitTransaction;
  // const gasLimitEstimate: number = uniswapish.gasLimitEstimate;


  // const price: Fractionish =
  //   tradeInfo.expectedTrade.trade.executionPrice.invert();
  // if (
  //   limitPrice &&
  //   new Decimal(price.toFixed(8)).gt(new Decimal(limitPrice))
  // ) {
  //   logger.error('Swap price exceeded limit price.');
  //   throw new HttpException(
  //     500,
  //     SWAP_PRICE_EXCEEDS_LIMIT_PRICE_ERROR_MESSAGE(
  //       price.toFixed(8),
  //       limitPrice
  //     ),
  //     SWAP_PRICE_EXCEEDS_LIMIT_PRICE_ERROR_CODE
  //   );
  // }

  const tx = await panopticish.executeTrade(
    wallet,
    req.positionIdList,
    BigNumber.from(req.positionSize),
    req.effectiveLiquidityLimit,
    req.panopticPool,
    panopticPoolAbi.abi
    // require('./panoptic_panopticpool_abi.json').abi
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
    `Trade has been executed, txHash is ${tx.hash}, nonce is ${tx.nonce}, gasPrice is ${gasPrice}.`
  );

  return {
    network: ethereumish.chain,
    timestamp: startTimestamp,
    // latency: latency(startTimestamp, Date.now()),
    // base: tradeInfo.baseToken.address,
    // quote: tradeInfo.quoteToken.address,
    // amount: new Decimal(req.amount).toFixed(tradeInfo.baseToken.decimals),
    // rawAmount: tradeInfo.requestAmount.toString(),
    // expectedIn: tradeInfo.expectedTrade.expectedAmount.toSignificant(8),
    // price: price.toSignificant(8),
    // gasPrice: gasPrice,
    // gasPriceToken: ethereumish.nativeTokenSymbol,
    // gasLimit: gasLimitTransaction,
    // gasCost: gasCostInEthString(gasPrice, gasLimitEstimate),
    nonce: tx.nonce,
    txHash: tx.hash,
  };
}