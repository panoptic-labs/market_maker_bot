// import { percentRegexp } from '../../services/config-manager-v2';
import { 
  BigNumber, 
  // ContractInterface,
  // Transaction, 
  Contract, 
  Wallet 
} from 'ethers';
import { PanopticConfig } from './panoptic.config';
import {
  Token,
  TokenAmount,
  Trade,
  Pair,
  TradeType,
  Route,
  Price,
} from '@uniswap/sdk';
// import Decimal from 'decimal.js-light';
// import axios from 'axios';
import { logger } from '../../services/logger';
import { Ethereum } from '../../chains/ethereum/ethereum';
// import {
//   ExpectedTrade,
//   // Uniswapish 
// } from '../../services/common-interfaces';
// import {
//   HttpException,
//   TRADE_FAILED_ERROR_CODE,
//   TRADE_FAILED_ERROR_MESSAGE,
//   UniswapishPriceError,
//   UNKNOWN_ERROR_ERROR_CODE,
//   UNKNOWN_ERROR_MESSAGE,
// } from '../../services/error-handler';
import { getAddress } from 'ethers/lib/utils';

export function newFakeTrade(
  tokenIn: Token,
  tokenOut: Token,
  tokenInAmount: BigNumber,
  tokenOutAmount: BigNumber
): Trade {
  const baseAmount = new TokenAmount(tokenIn, tokenInAmount.toString());
  const quoteAmount = new TokenAmount(tokenOut, tokenOutAmount.toString());
  // Pair needs the reserves but this is not possible to pull in sushiswap contract
  const pair = new Pair(baseAmount, quoteAmount);
  const route = new Route([pair], tokenIn, tokenOut);
  const trade = new Trade(route, baseAmount, TradeType.EXACT_INPUT);
  // hack to set readonly component given we can't easily get pool token amounts
  (trade.executionPrice as Price) = new Price(
    tokenIn,
    tokenOut,
    tokenInAmount.toBigInt(),
    tokenOutAmount.toBigInt()
  );
  return trade;
}

export class Panoptic {
  private static _instances: { [name: string]: Panoptic };
  private chainInstance;
  private _chain: string;
  private _network: string;
  private _multiCallAddress: string;
  private _UniswapV3Factory: string;
  private _NonFungiblePositionManager: string;
  private _SemiFungiblePositionManager: string;
  private _PanopticFactory: string;
  private _PanopticHelper: string;
  private _UniswapMigrator: string;
  private _gasLimitEstimate: number;
  private _ttl: number;
  private chainId;
  private tokenList: Record<string, Token> = {};
  private _ready: boolean = false;

  private constructor(chain: string, network: string) {
    this._chain = chain;
    this._network = network;
    const config = PanopticConfig.config;
    this.chainInstance = this.getChainInstance(network);
    this.chainId = this.chainInstance.chainId;
    this._multiCallAddress = config.multiCallAddress(chain, network);
    this._UniswapV3Factory = config.UniswapV3Factory(chain, network);
    this._NonFungiblePositionManager = config.NonFungiblePositionManager(chain, network);
    this._SemiFungiblePositionManager = config.SemiFungiblePositionManager(chain, network);
    this._PanopticFactory = config.PanopticFactory(chain, network);
    this._PanopticHelper = config.PanopticHelper(chain, network);
    this._UniswapMigrator = config.UniswapMigrator(chain, network);
    this._ttl = config.ttl;
    this._gasLimitEstimate = config.gasLimitEstimate;
  }

  public static getInstance(chain: string, network: string): Panoptic {
    if (Panoptic._instances === undefined) {
      Panoptic._instances = {};
    }
    if (!(chain + network in Panoptic._instances)) {
      Panoptic._instances[chain + network] = new Panoptic(chain, network);
    }

    return Panoptic._instances[chain + network];
  }

  public getChainInstance(network: string) {
    if (this._chain === 'ethereum') {
      return Ethereum.getInstance(network);
    } else {
      throw new Error('unsupported chain');
    }
  }

  /**
   * Given a token's address, return the connector's native representation of
   * the token.
   *
   * @param address Token address
   */
  public getTokenByAddress(address: string): Token {
    return this.tokenList[getAddress(address)];
  }

  public async init() {
    if (!this.chainInstance.ready()) {
      await this.chainInstance.init();
    }
    for (const token of this.chainInstance.storedTokenList) {
      this.tokenList[token.address] = new Token(
        this.chainId,
        token.address,
        token.decimals,
        token.symbol,
        token.name
      );
    }
    this._ready = true;
  }

  public ready(): boolean {
    return this._ready;
  }

  /**
   * Router address.
   */
  public get multiCallAddress(): string {
    return this._multiCallAddress;
  }
  public get UniswapV3Factory(): string {
    return this._UniswapV3Factory;
  }
  public get NonFungiblePositionManager(): string {
    return this._NonFungiblePositionManager;
  }
  public get SemiFungiblePositionManager(): string {
    return this._SemiFungiblePositionManager;
  }
  public get PanopticFactory(): string {
    return this._PanopticFactory;
  }
  public get PanopticHelper(): string {
    return this._PanopticHelper;
  }
  public get UniswapMigrator(): string {
    return this._UniswapMigrator;
  }



  /**
   * Default gas limit for swap transactions.
   */
  public get gasLimitEstimate(): number {
    return this._gasLimitEstimate;
  }

  /**
   * Default time-to-live for swap transactions, in seconds.
   */
  public get ttl(): number {
    return this._ttl;
  }

  public get chainName(): string {
    if (this._chain === 'ethereum' && this._network === 'sepolia') {
      return 'eth';
    }
    // if (this._chain === 'ethereum' && this._network === 'mainnet') {
    //   return 'eth';
    // } else if (this._chain === 'ethereum' && this._network === 'arbitrum') {
    //   return 'arbitrum';
    // } else if (this._chain === 'ethereum' && this._network === 'optimism') {
    //   return 'optimism';
    // } else if (this._chain === 'avalanche') {
    //   return 'avax';
    // } else if (this._chain === 'binance-smart-chain') {
    //   return 'bsc';
    // }
    // else if (this._chain === 'polygon') {
    //   return 'polygon';
    // } else if (this._chain === 'harmony') {
    //   return 'harmony';
    // } else if (this._chain === 'cronos') {
    //   return 'cronos';
    // }
    return this._chain;
  }

  async executeTrade(
    wallet: Wallet,
    tokenId: string,
    positionSize: BigNumber,
    tickLimitHigh: BigNumber,
    tickLimitLow: BigNumber,
    panopticPool: string,
    panopticPoolAbi: any = require('./panoptic_panopticpool_abi.json').abi
  ): Promise<any> {
    try {
      logger.info(`Attempting option trade on contract ${panopticPool}...`)
      const panopticContract = new Contract(panopticPool, panopticPoolAbi, wallet);
      // Define the parameters for the mintOption function
      // const token0 = t0address; 
      // const token1 = t1address; 
      //const amount = ethers.utils.parseUnits("1.0", 18); // The amount of token0 to mint the option for, assuming 18 decimals
      //const strikePrice = ethers.utils.parseUnits(strikePrice, 18); // The strike price for the option, assuming 18 decimals
      //const expiration = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60); // Expiration time in seconds (30 days from now)

      // Call the mintOption function
      const tx = await panopticContract.mintOptions(
        tokenId, 
        positionSize, 
        0.0, 
        tickLimitLow, 
        tickLimitHigh
      );
      logger.info("Transaction submitted:", tx.hash);
      // Wait for the transaction to be mined
      const receipt = await tx.wait();
      logger.info("Transaction mined:", receipt.transactionHash);
      return { txHash: tx.hash };

    } catch (error) {
      logger.error("Error minting option:", error);
      return error;
    }
  }
}