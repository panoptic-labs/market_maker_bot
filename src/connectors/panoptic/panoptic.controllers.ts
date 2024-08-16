// import Decimal from 'decimal.js-light';
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
  MintRequest,
  BurnRequest
} from '../../options/options.requests';
import { Panoptic } from '../panoptic/panoptic';

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

export async function mint(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: MintRequest
): Promise<any> {
  const startTimestamp: number = Date.now();

  const { wallet } =
    await txWriteData(
      ethereumish,
      req.address
    );

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
    `Trade has been executed, tx: ${tx}, txHash is ${tx.hash}, nonce is ${tx.nonce}, gasPrice is ${gasPrice}.`
  );

  return {
    network: ethereumish.chain,
    timestamp: startTimestamp,
    nonce: tx.nonce,
    txHash: tx.hash,
  };
}

export async function burn(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: BurnRequest
): Promise<any> {
  const startTimestamp: number = Date.now();

  const { wallet } =
    await txWriteData(
      ethereumish,
      req.address
    );

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
    `Trade has been executed, txHash is ${tx.hash}, nonce is ${tx.nonce}, gasPrice is ${gasPrice}.`
  );

  return {
    network: ethereumish.chain,
    timestamp: startTimestamp,
    nonce: tx.nonce,
    txHash: tx.hash,
  };
}

export async function getCollateralToken0(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: any 
): Promise<string> {
  const { wallet } =
  await txWriteData(
    ethereumish,
    req.address
  );

  const token0 = await panopticish.collateralToken0(wallet);
  return token0;
}

export async function getCollateralToken1(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: any 
): Promise<string> {
  const { wallet } =
  await txWriteData(
    ethereumish,
    req.address
  );

  const token1 = await panopticish.collateralToken1(wallet);
  return token1;
}

export async function getAsset(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: any 
): Promise<string> {
  const { wallet } =
  await txWriteData(
    ethereumish,
    req.address
  );

  const asset = await panopticish.getAsset(
    wallet,
    req.collateralTracker
  );
  return asset;
}

export async function deposit(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: any 
): Promise<string> {
  const { wallet } =
  await txWriteData(
    ethereumish,
    req.address
  );

  const asset = await panopticish.deposit(
    wallet,
    req.collateralTracker,
    BigNumber.from(req.assets)
  );
  return asset;
}

export async function withdraw(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: any 
): Promise<string> {
  const { wallet } =
  await txWriteData(
    ethereumish,
    req.address
  );

  const shares = await panopticish.withdraw(
    wallet,
    req.collateralTracker,
    BigNumber.from(req.assets)
  );
  return shares;
}

export async function maxWithdraw(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: any 
): Promise<string> {
  const { wallet } =
  await txWriteData(
    ethereumish,
    req.address
  );

  const limit = await panopticish.maxWithdraw(
    wallet,
    req.collateralTracker
  );
  return limit;
}

export async function numberOfPositions(
  ethereumish: Ethereumish,
  panopticish: Panoptic,
  req: any 
): Promise<string> {
  const { wallet } =
  await txWriteData(
    ethereumish,
    req.address
  );

  const positions = await panopticish.numberOfPositions(
    wallet
  );
  return positions;
}
