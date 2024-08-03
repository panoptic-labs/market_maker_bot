import { percentRegexp } from '../../services/config-manager-v2';
import { 
  BigNumber, 
  ContractInterface, 
  // ContractTransaction, 
  Contract, 
  Transaction, 
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
import Decimal from 'decimal.js-light';
import axios from 'axios';
import { logger } from '../../services/logger';
import { Ethereum } from '../../chains/ethereum/ethereum';
import { ExpectedTrade } from '../../services/common-interfaces';
import {
  HttpException,
  TRADE_FAILED_ERROR_CODE,
  TRADE_FAILED_ERROR_MESSAGE,
  UniswapishPriceError,
  UNKNOWN_ERROR_ERROR_CODE,
  UNKNOWN_ERROR_MESSAGE,
} from '../../services/error-handler';
import { getAddress } from 'ethers/lib/utils';
// import{  TradeResponse } from '../../amm/amm.requests';
// import { AnyAaaaRecord } from 'dns';

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
  private _router: string;
  private _multiCallAddress: string;
  private _UniswapV3Factory: string;
  private _NonFungiblePositionManager: string;
  private _SemiFungiblePositionManager: string;
  private _PanopticFactory: string;
  private _PanopticHelper: string;
  private _UniswapMigrator: string;
  // private _sfpmAbi: any; 
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
    this._router = config.routerAddress(chain, network);
    this._multiCallAddress = config.multiCallAddress(chain, network); 
    this._UniswapV3Factory = config.UniswapV3Factory(chain, network); 
    this._NonFungiblePositionManager = config.NonFungiblePositionManager(chain, network); 
    this._SemiFungiblePositionManager = config.SemiFungiblePositionManager(chain, network); 
    this._PanopticFactory = config.PanopticFactory(chain, network); 
    this._PanopticHelper = config.PanopticHelper(chain, network); 
    this._UniswapMigrator = config.UniswapMigrator(chain, network);
    // this._sfpmAbi = require(`./panoptic_sfpm_abi.json`).abi; 
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
  public get router(): string {
    return this._router;
  }
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
   * Router smart contract ABI.
   */
  public get routerAbi(): ContractInterface {
    return '';
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

  getSlippageNumberage(): number {
    const allowedSlippage = PanopticConfig.config.allowedSlippage;
    const nd = allowedSlippage.match(percentRegexp);
    if (nd) return Number(nd[1]);
    throw new Error(
      'Encountered a malformed percent string in the config for ALLOWED_SLIPPAGE.'
    );
  }


  /**
   * Given the amount of `baseToken` to put into a transaction, calculate the
   * amount of `quoteToken` that can be expected from the transaction.
   *
   * This is typically used for calculating token sell prices.
   *
   * @param baseToken Token input for the transaction
   * @param quoteToken Output from the transaction
   * @param amount Amount of `baseToken` to put into the transaction
   */
  async estimateSellTrade(
    baseToken: Token,
    quoteToken: Token,
    amount: BigNumber
  ): Promise<ExpectedTrade> {
    logger.info(
      `estimateSellTrade getting amounts out baseToken(${baseToken.symbol}): ${baseToken.address} - quoteToken(${quoteToken.symbol}): ${quoteToken.address}.`
    );

    logger.info(
      `TESTA`
    );

    const reqAmount = new Decimal(amount.toString())
      .div(new Decimal((10 ** baseToken.decimals).toString()))
      .toNumber();
    logger.info(`reqAmount(${baseToken.symbol}):${reqAmount}`);
    const gasPrice = this.chainInstance.gasPrice;
    logger.info(`TESTC - Gas price: ${gasPrice}`);
    let quoteRes;
    try {
      quoteRes = await axios.get(
        //`https://XXXapi.XXX.XXX/${this.chainName}/quote`,
        `https://api.goldsky.com/api/public/project_cl9gc21q105380hxuh8ks53k3/subgraphs/panoptic-subgraph-sepolia/beta7-prod/gn`,
        {
          params: {
            inTokenAddress: baseToken.address,
            outTokenAddress: quoteToken.address,
            amount: reqAmount,
            gasPrice: gasPrice,
          },
        }
      );
    } catch (e) {
      if (e instanceof Error) {
        logger.error(`Could not get trade info. ${e.message}`);
        throw new HttpException(
          500,
          TRADE_FAILED_ERROR_MESSAGE + e.message,
          TRADE_FAILED_ERROR_CODE
        );
      } else {
        logger.error('Unknown error trying to get trade info.');
        throw new HttpException(
          500,
          UNKNOWN_ERROR_MESSAGE,
          UNKNOWN_ERROR_ERROR_CODE
        );
      }
    }

    if (quoteRes.status == 200) {
      if (
        quoteRes.data.code == 200 &&
        Number(quoteRes.data.data.outAmount) > 0
      ) {
        const quoteData = quoteRes.data.data;
        logger.info(
          `estimateSellTrade quoteData inAmount(${baseToken.symbol}): ${quoteData.inAmount}, outAmount(${quoteToken.symbol}): ${quoteData.outAmount}`
        );
        const amounts = [quoteData.inAmount, quoteData.outAmount];
        const maximumOutput = new TokenAmount(
          quoteToken,
          amounts[1].toString()
        );
        const trade = newFakeTrade(
          baseToken,
          quoteToken,
          BigNumber.from(amounts[0]),
          BigNumber.from(amounts[1])
        );
        return { trade: trade, expectedAmount: maximumOutput };
      } else {
        throw new UniswapishPriceError(
          `priceSwapIn: no trade pair found for ${baseToken.address} to ${quoteToken.address}.`
        );
      }
    }
    throw new HttpException(
      quoteRes.status,
      `Could not get trade info. ${quoteRes.statusText}`,
      TRADE_FAILED_ERROR_CODE
    );
  }

  /**
   * Given the amount of `baseToken` desired to acquire from a transaction,
   * calculate the amount of `quoteToken` needed for the transaction.
   *
   * This is typically used for calculating token buy prices.
   *
   * @param quoteToken Token input for the transaction
   * @param baseToken Token output from the transaction
   * @param amount Amount of `baseToken` desired from the transaction
   */
  async estimateBuyTrade(
    quoteToken: Token,
    baseToken: Token,
    amount: BigNumber
  ): Promise<ExpectedTrade> {
    logger.info(
      `estimateBuyTrade getting amounts in quoteToken(${quoteToken.symbol}): ${quoteToken.address} - baseToken(${baseToken.symbol}): ${baseToken.address}.`
    );

    const reqAmount = new Decimal(amount.toString())
      .div(new Decimal((10 ** baseToken.decimals).toString()))
      .toNumber();
    logger.info(`reqAmount:${reqAmount}`);
    const gasPrice = this.chainInstance.gasPrice;
    let quoteRes;
    try {
      quoteRes = await axios.get(
        //`https://XXXapi.XXX.XXX/${this.chainName}/reverseQuote`,
        `https://api.goldsky.com/api/public/project_cl9gc21q105380hxuh8ks53k3/subgraphs/panoptic-subgraph-sepolia/beta7-prod/gn`,
        {
          params: {
            inTokenAddress: baseToken.address,
            outTokenAddress: quoteToken.address,
            amount: reqAmount,
            gasPrice: gasPrice,
          },
        }
      );
    } catch (e) {
      if (e instanceof Error) {
        logger.error(`Could not get trade info. ${e.message}`);
        throw new HttpException(
          500,
          TRADE_FAILED_ERROR_MESSAGE + e.message,
          TRADE_FAILED_ERROR_CODE
        );
      } else {
        logger.error('Unknown error trying to get trade info.');
        throw new HttpException(
          500,
          UNKNOWN_ERROR_MESSAGE,
          UNKNOWN_ERROR_ERROR_CODE
        );
      }
    }
    if (quoteRes.status == 200) {
      if (
        quoteRes.data.code == 200 &&
        Number(quoteRes.data.data.reverseAmount) > 0
      ) {
        const quoteData = quoteRes.data.data;
        logger.info(
          `estimateBuyTrade reverseData inAmount(${quoteToken.symbol}): ${quoteData.reverseAmount}, outAmount(${baseToken.symbol}): ${quoteData.inAmount}`
        );
        const amounts = [quoteData.reverseAmount, quoteData.inAmount];
        const minimumInput = new TokenAmount(quoteToken, amounts[0].toString());
        const trade = newFakeTrade(
          quoteToken,
          baseToken,
          BigNumber.from(amounts[0]),
          BigNumber.from(amounts[1])
        );
        return { trade: trade, expectedAmount: minimumInput };
      } else {
        throw new UniswapishPriceError(
          `priceSwapIn: no trade pair found for ${baseToken} to ${quoteToken}.`
        );
      }
    }
    throw new HttpException(
      quoteRes.status,
      `Could not get trade info. ${quoteRes.statusText}`,
      TRADE_FAILED_ERROR_CODE
    );
  }

  /**
   * Given a wallet and a Uniswap-ish trade, try to execute it on blockchain.
   *
   * @param wallet Wallet
   * @param trade Expected trade
   * @param gasPrice Base gas price, for pre-EIP1559 transactions
   * @param panopticRouter smart contract address
   * @param ttl How long the swap is valid before expiry, in seconds
   * @param abi Router contract ABI
   * @param gasLimit Gas limit
   * @param nonce (Optional) EVM transaction nonce
   * @param maxFeePerGas (Optional) Maximum total fee per gas you want to pay
   * @param maxPriorityFeePerGas (Optional) Maximum tip per gas you want to pay
   */
  async executeTrade(
    wallet: Wallet,
    trade: Trade,
    gasPrice: number,
    panopticRouter: string,
    ttl: number,
    abi: ContractInterface,
    gasLimit: number,
    nonce?: number,
    maxFeePerGas?: BigNumber,
    maxPriorityFeePerGas?: BigNumber
  ): Promise<Transaction> {
    logger.info(
      `executeTrade ${panopticRouter}-${ttl}-${abi}-${gasPrice}-${gasLimit}-${nonce}-${maxFeePerGas}-${maxPriorityFeePerGas}.`
    );
    const inToken: any = trade.route.input;
    const outToken: any = trade.route.output;
    let swapRes;
    try {
      swapRes = await axios.get(
        `https://open-api.panoptic.finance/v3/${this.chainName}/swap_quote`,
        {
          params: {
            inTokenAddress: inToken.address,
            outTokenAddress: outToken.address,
            amount: trade.inputAmount.toExact(),
            slippage: this.getSlippageNumberage(),
            account: wallet.address,
            gasPrice: gasPrice.toString(),
            // referrer: '0x3fb06064b88a65ba9b9eb840dbb5f3789f002642',
            referrer: '0x9d9EAc8481C3a824E524775314e39c0c5F5f88A9', //Nick's metamask wallet
          },
        }
      );
    } catch (e) {
      if (e instanceof Error) {
        logger.error(`Could not get trade info. ${e.message}`);
        throw new HttpException(
          500,
          TRADE_FAILED_ERROR_MESSAGE + e.message,
          TRADE_FAILED_ERROR_CODE
        );
      } else {
        logger.error('Unknown error trying to get trade info.');
        throw new HttpException(
          500,
          UNKNOWN_ERROR_MESSAGE,
          UNKNOWN_ERROR_ERROR_CODE
        );
      }
    }
    if (swapRes.status == 200 && swapRes.data.code == 200) {
      const swapData = swapRes.data.data;
      return this.chainInstance.nonceManager.provideNonce(
        nonce,
        wallet.address,
        async (nextNonce) => {
          const gas = Math.ceil(Number(swapData.estimatedGas) * 1.15);
          const trans = {
            nonce: nextNonce,
            from: swapData.from,
            to: swapData.to,
            gasLimit: BigNumber.from(gas.toString()),
            data: swapData.data,
            value: BigNumber.from(swapData.value),
            chainId: this.chainId,
          };
          const tx = await wallet.sendTransaction(trans);
          logger.info(JSON.stringify(tx));

          return tx;
        }
      );
    }
    throw new HttpException(
      swapRes.status,
      `Could not get trade info. ${swapRes.statusText}`,
      TRADE_FAILED_ERROR_CODE
    );
  }

  /**
   * 
   * @param wallet 
   * @param tokenId The tokenId of the minted position, which encodes information about up to 4 legs
   * @param positionSize Token output from the transaction
   * @param tickLimitLow
   * @param tickLimitHigh
   */


}

export async function mintTokenizedPosition(
  wallet: Wallet, 
  tokenId: string, 
  positionSize: BigNumber, 
  tickLimitHigh: BigNumber, 
  tickLimitLow: BigNumber, 
  SemiFungiblePositionManager: string = `0x77dcbA7729358D9F43AE4C3EA4206AA01c3d0056`,
  sfpmAbi: any = require(`./panoptic_sfpm_abi.json`).abi
  // panopticPool: string, 
): Promise<any> {
  try {
    logger.info(`Attempting option mint on contract ${SemiFungiblePositionManager}...`)
    const panopticContract = new Contract(SemiFungiblePositionManager, sfpmAbi, wallet);
    // Define the parameters for the mintOption function
    // const token0 = t0address; 
    // const token1 = t1address; 
    //const amount = ethers.utils.parseUnits("1.0", 18); // The amount of token0 to mint the option for, assuming 18 decimals
    //const strikePrice = ethers.utils.parseUnits(strikePrice, 18); // The strike price for the option, assuming 18 decimals
    //const expiration = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60); // Expiration time in seconds (30 days from now)

    // Call the mintOption function
    const tx = await panopticContract.mintTokenizedPosition(tokenId, positionSize, tickLimitLow, tickLimitHigh);
    logger.info("Transaction submitted:", tx.hash);
    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    logger.info("Transaction mined:", receipt.transactionHash);
    return { txHash: tx.hash  };

  } catch (error) {
    logger.error("Error minting option:", error);
    return error ; 
  }
}