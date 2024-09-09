import {
  BigNumber,
  Contract,
  Wallet
} from 'ethers';
import { PanopticConfig } from './panoptic.config';
import {
  Token
} from '@uniswap/sdk';
import { logger } from '../../services/logger';
import { Ethereum } from '../../chains/ethereum/ethereum';
import { getAddress } from 'ethers/lib/utils';
import panopticPoolAbi from './PanopticPool.ABI.json';
import tokenIdLibraryAbi from './TokenIdLibrary.ABI.json';
import panopticHelperAbi from './PanopticHelper.ABI.json';
import collateralTrackerAbi from './CollateralTracker.ABI.json';
import semiFungiblePositionManagerAbi from './SFPM.ABI.json';
import axios from 'axios';

export class Panoptic {
  private static _instances: { [name: string]: Panoptic };
  private chainInstance;
  private _chain: string;
  private _network: string;
  private _MulticallAddress: string;
  private _UniswapV3Factory: string;
  private _NonFungiblePositionManager: string;
  private _SemiFungiblePositionManager: string;
  private _PanopticFactory: string;
  private _PanopticHelper: string;
  private _UniswapMigrator: string;
  private _PanopticPool: string;
  private _TokenIdLibrary: string;
  private _gasLimitEstimate: number;
  private _ttl: number;
  private _subgraphUrl: string;
  private _lowestTick: number;
  private _highestTick: number;
  private chainId;
  private tokenList: Record<string, Token> = {};
  private _ready: boolean = false;

  private constructor(chain: string, network: string) {
    this._chain = chain;
    this._network = network;
    const config = PanopticConfig.config;
    this.chainInstance = this.getChainInstance(network);
    this.chainId = this.chainInstance.chainId;
    this._MulticallAddress = config.multiCallAddress(chain, network);
    this._UniswapV3Factory = config.UniswapV3Factory(chain, network);
    this._NonFungiblePositionManager = config.NonFungiblePositionManager(chain, network);
    this._SemiFungiblePositionManager = config.SemiFungiblePositionManager(chain, network);
    this._PanopticFactory = config.PanopticFactory(chain, network);
    this._PanopticHelper = config.PanopticHelper(chain, network);
    this._UniswapMigrator = config.UniswapMigrator(chain, network);
    this._PanopticPool = config.PanopticPool(chain, network);
    this._TokenIdLibrary = config.TokenIdLibrary(chain, network);
    this._ttl = config.ttl;
    this._subgraphUrl = config.subgraphUrl;
    this._lowestTick = config.lowestTick;
    this._highestTick = config.highestTick;
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

  public get multiCallAddress(): string {
    return this._MulticallAddress;
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
  public get PanopticPool(): string {
    return this._PanopticPool;
  }
  public get TokenIdLibrary(): string {
    return this._TokenIdLibrary;
  }
  public get LOWEST_POSSIBLE_TICK(): number {
    return this._lowestTick;
  }
  public get HIGHEST_POSSIBLE_TICK(): number {
    return this._highestTick; 
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

  public get subgraphUrl(): string {
    return this._subgraphUrl;
  }

  public get chainName(): string {
    if (this._chain === 'ethereum' && this._network === 'sepolia') {
      return 'eth';
    }
    return this._chain;
  }

  async _gradient(arr: number[]): Promise<number[]> {
    return arr.map((_, index, array) => {
      if (index === 0) {
        return array[1] - array[0];
      } else if (index === array.length - 1) {
        return array[array.length - 1] - array[array.length - 2];
      } else {
        return (array[index + 1] - array[index - 1]) / 2;
      }
    });
  }

  // TODO: Should check that this works
  async _getPayoffGradients(
      STRIKE: number,
      RANGE: number,
      PRICE: number
  ): Promise<{ payoffGradient: number[], pGradient: number[], index: number }> {
      const N = 1000;

      // Generate linspace array
      const linspace = (start: number, end: number, num: number): number[] => {
        const step = (end - start) / (num - 1);
        return Array.from({ length: num }, (_, i) => start + (i * step));
      };

      const p = linspace(STRIKE / 3, 1.75 * STRIKE, N);

      // Define the V function
      const V = (x: number, K: number, r: number): number => {
        if (x <= K / r) {
          return x;
        } else if (x > K / r && x <= K * r) {
          return (2 * Math.sqrt(x * K * r) - x - K) / (r - 1);
        } else {
          return K;
        }
      };

      // Calculate payoff
      const payoff = p.map(x => V(x, STRIKE, RANGE) - V(PRICE, STRIKE, RANGE));

      const payoffGradient = await this._gradient(payoff);
      const pGradient = await this._gradient(p);
      return { payoffGradient, pGradient, index: p.findIndex(x => x >= PRICE)};
  }

  // TODO: In the future, we could deliver a calculateObservedDelta and denote this as merely the
  //       Black-Scholles delta. Same for gamma.
  // TODO: Write a opinionated gateway method that wraps this one but passes in the Uniswap.currentTick for PRICE
  async calculateDelta(
    STRIKE: number,
    RANGE: number,
    PRICE: number
  ): Promise<number> {
    const { payoffGradient, pGradient, index } = await this._getPayoffGradients(STRIKE, RANGE, PRICE);

    const delta = Math.floor(100 * (payoffGradient[index] / pGradient[index]));

    return delta;
  }

  // TODO: Write a opinionated gateway method that wraps this one but passes in the Uniswap.currentTick for PRICE
  async calculateGamma(
    STRIKE: number,
    RANGE: number,
    PRICE: number
  ): Promise<number>  {
    const { payoffGradient, pGradient, index } = await this._getPayoffGradients(STRIKE, RANGE, PRICE);

    const payoffGradient2 = await this._gradient(payoffGradient);
    const pGradient2 = await this._gradient(pGradient);

    const gamma = Math.floor(100 * (payoffGradient2[index] / pGradient2[index]));

    return gamma;
  }

  // Subgraph interactions

  async queryOpenPositions(
    wallet: Wallet
  ): Promise<any> {
    try {
      const query = `
      query GetAccountsPositions(
        $account: String!
      ) {
       panopticPoolAccounts(
          where: { account: $account }
        ) {
          accountBalances(
            first: 32
            orderBy: createdBlockNumber
            orderDirection: desc
          ) {
            tokenId { id }
          }
          closedAccountBalances: accountBalances(
            first: 1000
            orderBy: closedTimestamp
            orderDirection: desc
            where: {
              isOpen: 0
              txnClosed_not: null
              txnClosed_: { eventType_in: [OptionBurn, AccountLiquidated, ForcedExercised] }
            }
          ) {
            tokenId { id }
          }
        }
      }
    `;
      const variables = {
        account: wallet.address.toLowerCase(),
      };
      const response = await this.querySubgraph(query, variables);
      return response;
    } catch (error) {
      logger.error("Error querying open positions:", error);
      return error;
    }
  }

  async querySubgraph(
    query: string,
    variables: any
  ): Promise<any> {
    try {
      const response = await axios.post(this.subgraphUrl, { query, variables });
      return response;
    } catch (error) {
      logger.error("Error querying Panoptic Subgraph:", error);
      return error;
    }
  }

  // PanopticHelper interactions

  async createBigLizard(
    wallet: Wallet, 
    univ3pool: BigNumber, 
    width: number, 
    longCallStrike: number, 
    straddleStrike: number, 
    asset: BigNumber,
  ): Promise<any> {
    try {
      const panopticHelperAddress = this.PanopticHelper;
      const panopticHelperContract = new Contract(panopticHelperAddress, panopticHelperAbi.abi, wallet);
      const response = await panopticHelperContract.createBigLizard(
        univ3pool, 
        width, 
        longCallStrike, 
        straddleStrike, 
        asset
      )
      return response
    } catch (error) {
      return error;
    }
  }

  async createCallCalendarSpread(
    wallet: Wallet, 
    univ3pool: BigNumber, 
    widthLong: number, 
    widthShort: number, 
    strike: number, 
    asset: BigNumber,
    optionRatio: BigNumber, 
    start: BigNumber
  ): Promise<any> {
    try {
      const panopticHelperAddress = this.PanopticHelper;
      const panopticHelperContract = new Contract(panopticHelperAddress, panopticHelperAbi.abi, wallet);
      const response = await panopticHelperContract.createCallCalendarSpread(
        univ3pool, 
        widthLong, 
        widthShort, 
        strike, 
        asset, 
        optionRatio, 
        start
      )
      return response
    } catch (error) {
      return error;
    }
  }

  async createCallDiagonalSpread(
    wallet: Wallet, 
    univ3pool: BigNumber, 
    widthLong: number, 
    widthShort: number, 
    strikeLong: number, 
    strikeShort: number,
    asset: BigNumber, 
    optionRatio: BigNumber,
    start: BigNumber
  ): Promise<any> {
    try {
      const panopticHelperAddress = this.PanopticHelper;
      const panopticHelperContract = new Contract(panopticHelperAddress, panopticHelperAbi.abi, wallet);
      const response = await panopticHelperContract.createCallDiagonalSpread(
        univ3pool, 
        widthLong, 
        widthShort, 
        strikeLong, 
        strikeShort, 
        asset,
        optionRatio, 
        start
      )
      return response
    } catch (error) {
      return error;
    }
  }

  async createCallRatioSpread(
    wallet: Wallet, 
    univ3pool: BigNumber, 
    width: number, 
    longStrike: number, 
    shortStrike: number,
    asset: BigNumber, 
    ratio: BigNumber,
    start: BigNumber
  ): Promise<any> {
    try {
      const panopticHelperAddress = this.PanopticHelper;
      const panopticHelperContract = new Contract(panopticHelperAddress, panopticHelperAbi.abi, wallet);
      const response = await panopticHelperContract.createCallRatioSpread(
        univ3pool, 
        width, 
        longStrike, 
        shortStrike, 
        asset,
        ratio, 
        start
      )
      return response
    } catch (error) {
      return error;
    }
  }

  async createCallSpread(
    wallet: Wallet, 
    univ3pool: BigNumber, 
    width: number, 
    strikeLong: number, 
    strikeShort: number,
    asset: BigNumber, 
    optionRatio: BigNumber,
    start: BigNumber
  ): Promise<any> {
    try {
      const panopticHelperAddress = this.PanopticHelper;
      const panopticHelperContract = new Contract(panopticHelperAddress, panopticHelperAbi.abi, wallet);
      const response = await panopticHelperContract.createCallSpread(
        univ3pool, 
        width, 
        strikeLong, 
        strikeShort, 
        asset,
        optionRatio, 
        start
      )
      return response
    } catch (error) {
      return error;
    }
  }

  async createCallZEBRASpread(
    wallet: Wallet, 
    univ3pool: BigNumber, 
    width: number, 
    longStrike: number, 
    shortStrike: number,
    asset: BigNumber, 
    ratio: BigNumber,
    start: BigNumber
  ): Promise<any> {
    try {
      const panopticHelperAddress = this.PanopticHelper;
      const panopticHelperContract = new Contract(panopticHelperAddress, panopticHelperAbi.abi, wallet);
      const response = await panopticHelperContract.createCallZEBRASpread(
        univ3pool, 
        width, 
        longStrike, 
        shortStrike, 
        asset,
        ratio, 
        start
      )
      return response
    } catch (error) {
      return error;
    }
  }

  async createIronButterfly(
    wallet: Wallet, 
    univ3pool: BigNumber, 
    width: number, 
    strike: number, 
    wingWidth: number,
    asset: BigNumber
  ): Promise<any> {
    try {
      const panopticHelperAddress = this.PanopticHelper;
      const panopticHelperContract = new Contract(panopticHelperAddress, panopticHelperAbi.abi, wallet);
      const response = await panopticHelperContract.createIronButterfly(
        univ3pool, 
        width, 
        strike, 
        wingWidth, 
        asset
      )
      return response
    } catch (error) {
      return error;
    }
  }

  async createIronCondor(
    wallet: Wallet, 
    univ3pool: BigNumber, 
    width: number, 
    callStrike: number, 
    putStrike: number,
    wingWidth: number, 
    asset: BigNumber
  ): Promise<any> {
    try {
      const panopticHelperAddress = this.PanopticHelper;
      const panopticHelperContract = new Contract(panopticHelperAddress, panopticHelperAbi.abi, wallet);
      const response = await panopticHelperContract.createIronCondor(
        univ3pool, 
        width, 
        callStrike, 
        putStrike, 
        wingWidth,
        asset
      )
      return response
    } catch (error) {
      return error;
    }
  }

  async createJadeLizard(
    wallet: Wallet, 
    univ3pool: BigNumber, 
    width: number, 
    longCallStrike: number, 
    shortCallStrike: number,
    shortPutStrike: number, 
    asset: BigNumber
  ): Promise<any> {
    try {
      const panopticHelperAddress = this.PanopticHelper;
      const panopticHelperContract = new Contract(panopticHelperAddress, panopticHelperAbi.abi, wallet);
      const response = await panopticHelperContract.createJadeLizard(
        univ3pool, 
        width, 
        longCallStrike, 
        shortCallStrike, 
        shortPutStrike,
        asset
      )
      return response
    } catch (error) {
      return error;
    }
  }

  async createPutCalendarSpread(
    wallet: Wallet, 
    univ3pool: BigNumber, 
    widthLong: number, 
    widthShort: number, 
    strike: number,
    asset: BigNumber, 
    optionRatio: BigNumber,
    start: BigNumber
  ): Promise<any> {
    try {
      const panopticHelperAddress = this.PanopticHelper;
      const panopticHelperContract = new Contract(panopticHelperAddress, panopticHelperAbi.abi, wallet);
      const response = await panopticHelperContract.createPutCalendarSpread(
        univ3pool, 
        widthLong, 
        widthShort, 
        strike, 
        asset,
        optionRatio,
        start
      )
      return response
    } catch (error) {
      return error;
    }
  }

  async createPutDiagonalSpread(
    wallet: Wallet, 
    univ3pool: BigNumber, 
    widthLong: number, 
    widthShort: number, 
    strikeLong: number,
    strikeShort: number, 
    asset: BigNumber, 
    optionRatio: BigNumber,
    start: BigNumber
  ): Promise<any> {
    try {
      const panopticHelperAddress = this.PanopticHelper;
      const panopticHelperContract = new Contract(panopticHelperAddress, panopticHelperAbi.abi, wallet);
      const response = await panopticHelperContract.createPutDiagonalSpread(
        univ3pool, 
        widthLong, 
        widthShort, 
        strikeLong, 
        strikeShort,
        asset,
        optionRatio,
        start
      )
      return response
    } catch (error) {
      return error;
    }
  }

  async createPutRatioSpread(
    wallet: Wallet, 
    univ3pool: BigNumber, 
    width: number, 
    longStrike: number,
    shortStrike: number, 
    asset: BigNumber, 
    ratio: BigNumber,
    start: BigNumber
  ): Promise<any> {
    try {
      const panopticHelperAddress = this.PanopticHelper;
      const panopticHelperContract = new Contract(panopticHelperAddress, panopticHelperAbi.abi, wallet);
      const response = await panopticHelperContract.createPutRatioSpread(
        univ3pool, 
        width, 
        longStrike, 
        shortStrike,
        asset,
        ratio,
        start
      )
      return response
    } catch (error) {
      return error;
    }
  }

  async createPutSpread(
    wallet: Wallet, 
    univ3pool: BigNumber, 
    width: number, 
    strikeLong: number, 
    strikeShort: number,
    asset: BigNumber, 
    optionRatio: BigNumber,
    start: BigNumber
  ): Promise<any> {
    try {
      const panopticHelperAddress = this.PanopticHelper;
      const panopticHelperContract = new Contract(panopticHelperAddress, panopticHelperAbi.abi, wallet);
      const response = await panopticHelperContract.createPutSpread(
        univ3pool, 
        width, 
        strikeLong, 
        strikeShort, 
        asset,
        optionRatio,
        start
      )
      return response
    } catch (error) {
      return error;
    }
  }

  async createPutZEBRASpread(
    wallet: Wallet, 
    univ3pool: BigNumber, 
    width: number, 
    longStrike: number, 
    shortStrike: number,
    asset: BigNumber, 
    ratio: BigNumber,
    start: BigNumber
  ): Promise<any> {
    try {
      const panopticHelperAddress = this.PanopticHelper;
      const panopticHelperContract = new Contract(panopticHelperAddress, panopticHelperAbi.abi, wallet);
      const response = await panopticHelperContract.createPutZEBRASpread(
        univ3pool, 
        width, 
        longStrike, 
        shortStrike, 
        asset,
        ratio,
        start
      )
      return response
    } catch (error) {
      return error;
    }
  }

  async createStraddle(
    wallet: Wallet, 
    univ3pool: BigNumber, 
    width: number, 
    strike: number, 
    asset: BigNumber,
    isLong: BigNumber, 
    optionRatio: BigNumber,
    start: BigNumber
  ): Promise<any> {
    try {
      const panopticHelperAddress = this.PanopticHelper;
      const panopticHelperContract = new Contract(panopticHelperAddress, panopticHelperAbi.abi, wallet);
      const response = await panopticHelperContract.createStraddle(
        univ3pool, 
        width, 
        strike, 
        asset, 
        isLong,
        optionRatio,
        start
      )
      return response
    } catch (error) {
      return error;
    }
  }

  async createStrangle(
    wallet: Wallet, 
    univ3pool: BigNumber, 
    width: number, 
    callStrike: number, 
    putStrike: number,
    asset: BigNumber, 
    isLong: BigNumber, 
    optionRatio: BigNumber,
    start: BigNumber
  ): Promise<any> {
    try {
      const panopticHelperAddress = this.PanopticHelper;
      const panopticHelperContract = new Contract(panopticHelperAddress, panopticHelperAbi.abi, wallet);
      const response = await panopticHelperContract.createStrangle(
        univ3pool, 
        width, 
        callStrike, 
        putStrike, 
        asset,
        isLong,
        optionRatio,
        start
      )
      return response
    } catch (error) {
      return error;
    }
  }

  async createSuperBear(
    wallet: Wallet, 
    univ3pool: BigNumber, 
    width: number, 
    longPutStrike: number, 
    shortPutStrike: number,
    shortCallStrike: number,
    asset: BigNumber
  ): Promise<any> {
    try {
      const panopticHelperAddress = this.PanopticHelper;
      const panopticHelperContract = new Contract(panopticHelperAddress, panopticHelperAbi.abi, wallet);
      const response = await panopticHelperContract.createSuperBear(
        univ3pool, 
        width, 
        longPutStrike, 
        shortPutStrike, 
        shortCallStrike,
        asset
      )
      return response
    } catch (error) {
      return error;
    }
  }

  async createSuperBull(
    wallet: Wallet, 
    univ3pool: BigNumber, 
    width: number, 
    longCallStrike: number, 
    shortCallStrike: number,
    shortPutStrike: number, 
    asset: BigNumber
  ): Promise<any> {
    try {
      const panopticHelperAddress = this.PanopticHelper;
      const panopticHelperContract = new Contract(panopticHelperAddress, panopticHelperAbi.abi, wallet);
      const response = await panopticHelperContract.createSuperBull(
        univ3pool, 
        width, 
        longCallStrike, 
        shortCallStrike, 
        shortPutStrike,
        asset
      )
      return response
    } catch (error) {
      return error;
    }
  }

  async createZEEHBS(
    wallet: Wallet, 
    univ3pool: BigNumber, 
    width: number, 
    longStrike: number, 
    shortStrike: number,
    asset: BigNumber,
    ratio: BigNumber
  ): Promise<any> {
    try {
      const panopticHelperAddress = this.PanopticHelper;
      const panopticHelperContract = new Contract(panopticHelperAddress, panopticHelperAbi.abi, wallet);
      const response = await panopticHelperContract.createZEEHBS(
        univ3pool, 
        width, 
        longStrike, 
        shortStrike, 
        asset,
        ratio
      )
      return response
    } catch (error) {
      return error;
    }
  }

  // TODO: These methods on the helper aren't live yet; eventually, this will be the easier way
  //       to get multiple greeks in one call.
  async queryGreeks(
    wallet: Wallet,
    tick: number,
    positionIdList: BigNumber[],
    greek: string
  ): Promise<any> {
    try {
      const panopticHelper = this.PanopticHelper;
      const panopticHelperContract = new Contract(panopticHelper, panopticHelperAbi.abi, wallet);
      let response;
      if (greek === "delta") {
        response = await panopticHelperContract.delta(this.PanopticPool, wallet.address, tick, positionIdList);
      } else if (greek === "gamma") {
        response = await panopticHelperContract.gamma(this.PanopticPool, wallet.address, tick, positionIdList);
      } else {
        throw new Error("Invalid greek");
      }
      return response;
    } catch (error) {
      logger.error(`Error checking ${greek}...`, error);
      return error;
    }
  }

  // PanopticPool interactions

  async calculateAccumulatedFeesBatch(
    wallet: Wallet,
    includePendingPremium: boolean = false,
    positionIdList: BigNumber[]
  ): Promise<any> {
    try {
      const panopticpool = this.PanopticPool;
      const panopticPoolContract = new Contract(panopticpool, panopticPoolAbi.abi, wallet);
      const response = await panopticPoolContract.calculateAccumulatedFeesBatch(
        wallet.address,
        includePendingPremium,
        positionIdList
      );
      return response;
    } catch (error) {
      logger.error("Error on calculateAccumulatedFeesBatch:", error);
      return error;
    }
  }

  async collateralToken0(
    wallet: Wallet
  ): Promise<any> {
    try {
      const panopticpool = this.PanopticPool;
      const panopticPoolContract = new Contract(panopticpool, panopticPoolAbi.abi, wallet);
      const response = await panopticPoolContract.collateralToken0();
      const tokenContract = new Contract(response, collateralTrackerAbi.abi, wallet);
      const asset = await tokenContract.asset();
      logger.info(`Collateral token 0: ${asset}`);
      const symbol = await tokenContract.symbol();
      logger.info(`Symbol token 0: ${symbol}`);
      return response;
    } catch (error) {
      logger.error("Error fetching collateral token 0:", error);
      return error;
    }
  }

  async collateralToken1(wallet: Wallet): Promise<any> {
    try {
      const panopticpool = this.PanopticPool;
      logger.info(`Fetching CollateralTracker for token 1 from contract ${panopticpool}...`);
      const panopticPoolContract = new Contract(panopticpool, panopticPoolAbi.abi, wallet);
      const response = await panopticPoolContract.collateralToken1();
      const tokenContract = new Contract(response, collateralTrackerAbi.abi, wallet);
      const asset = await tokenContract.asset();
      logger.info(`Collateral token 1: ${asset}`);
      const symbol = await tokenContract.symbol();
      logger.info(`Symbol token 1: ${symbol}`);
      return response;
    } catch (error) {
      logger.error("Error fetching collateral token 1:", error);
      return error;
    }
  }

  async executeBurn(
    wallet: Wallet,
    burnTokenId: BigNumber,
    newPositionIdList: BigNumber[],
    tickLimitLow: number = this.LOWEST_POSSIBLE_TICK,
    tickLimitHigh: number = this.HIGHEST_POSSIBLE_TICK
  ): Promise<any> {
    try {
      const panopticpool = this.PanopticPool;
      logger.info(`Attempting option burn on contract ${panopticpool}...`);
      const panopticPoolContract = new Contract(panopticpool, panopticPoolAbi.abi, wallet);
      const response = await panopticPoolContract["burnOptions(uint256,uint256[],int24,int24)"](
        burnTokenId,
        newPositionIdList,
        tickLimitLow,
        tickLimitHigh,
        { gasLimit: this.gasLimitEstimate }
      );
      logger.info("Transaction submitted:", response.hash);
      const receipt = await response.wait();
      logger.info("Transaction mined:", receipt.transactionHash);
      return response;
    } catch (error) {
      logger.error("Error burning option:", error);
      return error;
    }
  }

  async forceExercise(
    wallet: Wallet,
    touchedId: BigNumber[],
    positionIdListExercisee: BigNumber[],
    positionIdListExercisor: BigNumber[]
  ): Promise<any> {
    try {
      const panopticpool = this.PanopticPool;
      logger.info(`Attempting force exercise on contract ${panopticpool}...`);
      const panopticPoolContract = new Contract(panopticpool, panopticPoolAbi.abi, wallet);
      const response = await panopticPoolContract.forceExercise(
        wallet.address,
        touchedId,
        positionIdListExercisee,
        positionIdListExercisor,
        { gasLimit: this.gasLimitEstimate }
      );
      logger.info("Transaction submitted:", response.hash);
      const receipt = await response.wait();
      logger.info("Transaction mined:", receipt.transactionHash);
      return response;
    } catch (error) {
      logger.error("Error on force exercise:", error);
      return error;
    }
  }

  async liquidate(
    wallet: Wallet,
    positionIdListLiquidator: BigNumber[],
    liquidatee: BigNumber,
    delegations: number,
    positionIdList: BigNumber[],
  ): Promise<any> {
    try {
      const panopticpool = this.PanopticPool;
      logger.info(`Attempting liquidation on contract ${panopticpool}...`);
      const panopticPoolContract = new Contract(panopticpool, panopticPoolAbi.abi, wallet);
      const response = await panopticPoolContract.liquidate(
        positionIdListLiquidator,
        liquidatee,
        delegations,
        positionIdList,
        { gasLimit: this.gasLimitEstimate }
      );
      logger.info("Transaction submitted:", response.hash);
      const receipt = await response.wait();
      logger.info("Transaction mined:", receipt.transactionHash);
      return response;
    } catch (error) {
      logger.error("Error on liquidation:", error);
      return error;
    }
  }

  async executeMint(
    wallet: Wallet,
    positionIdList: BigNumber[],
    positionSize: BigNumber,
    effectiveLiquidityLimit: BigNumber,
    tickLimitLow: number = this.LOWEST_POSSIBLE_TICK,
    tickLimitHigh: number = this.HIGHEST_POSSIBLE_TICK
  ): Promise<any> {
    try {
      const panopticpool = this.PanopticPool;
      logger.info(`Attempting option mint on contract ${panopticpool}...`);
      const panopticPoolContract = new Contract(panopticpool, panopticPoolAbi.abi, wallet);
      const response = await panopticPoolContract.mintOptions(
        positionIdList,
        positionSize,
        effectiveLiquidityLimit,
        tickLimitLow,
        tickLimitHigh,
        { gasLimit: this.gasLimitEstimate }
      );
      logger.info("Transaction submitted:", response.hash);
      const receipt = await response.wait();
      logger.info("Transaction mined:", receipt.transactionHash);
      return response;
    } catch (error) {
      logger.error("Error on mintOptions:", error);
      return error;
    }
  }

  async numberOfPositions(
    wallet: Wallet
  ): Promise<any> {
    try {
      const panopticpool = this.PanopticPool;
      logger.info(`Checking numberOfPositions...`)
      const panopticPoolContract = new Contract(panopticpool, panopticPoolAbi.abi, wallet);
      const response = await panopticPoolContract.numberOfPositions(wallet.address);
      logger.info(`numberOfPositions: ${response}`);
      return response;
    } catch (error) {
      logger.error("Error on numberOfPositions:", error);
      return error;
    }
  }

  async optionPositionBalance(
    wallet: Wallet,
    tokenId: BigNumber
  ): Promise<any> {
    try {
      const panopticpool = this.PanopticPool;
      logger.info(`Checking optionPositionBalance...`)
      const panopticPoolContract = new Contract(panopticpool, panopticPoolAbi.abi, wallet);
      const response = await panopticPoolContract.optionPositionBalance(
        wallet.address,
        tokenId
      );
      logger.info(`optionPositionBalance: ${response}`);
      return response;
    } catch (error) {
      logger.error("Error on optionPositionBalance:", error);
      return error;
    }
  }

  async pokeMedian(
    wallet: Wallet
  ): Promise<any> {
    try {
      const panopticpool = this.PanopticPool;
      logger.info(`Checking pokeMedian...`)
      const panopticPoolContract = new Contract(panopticpool, panopticPoolAbi.abi, wallet);
      const response = await panopticPoolContract.pokeMedian();
      logger.info(`pokeMedian: ${response}`);
      return response;
    } catch (error) {
      logger.error("Error on pokeMedian:", error);
      return error;
    }
  }

  async settleLongPremium(
    wallet: Wallet,
    positionIdList: BigNumber[],
    owner: BigNumber,
    legIndex: BigNumber
  ): Promise<any> {
    try {
      const panopticpool = this.PanopticPool;
      logger.info(`Attempting settleLongPremium on contract ${panopticpool}...`)
      const panopticPoolContract = new Contract(panopticpool, panopticPoolAbi.abi, wallet);
      const response = await panopticPoolContract.settleLongPremium(
        positionIdList,
        owner,
        legIndex,
        { gasLimit: this.gasLimitEstimate }
      );
      logger.info("Transaction submitted:", response.hash);
      const receipt = await response.wait();
      logger.info("Transaction mined:", receipt.transactionHash);
      return response;
    } catch (error) {
      logger.error("Error on settleLongPremium:", error);
      return error;
    }
  }


  // CollateralTracker interactions

  async deposit(
    wallet: Wallet,
    collateralTrackerContract: any,
    assets: BigNumber
  ): Promise<any> {
    try {
      logger.info(`Attempting token deposit...`)
      const tokenContract = new Contract(collateralTrackerContract, collateralTrackerAbi.abi, wallet);
      const asset = await tokenContract.asset();
      logger.info(`Collateral token asset: ${asset}`);
      logger.info(`Wallet: ${wallet.address}, Assets: ${assets}`);
      const response = await tokenContract.deposit(assets, wallet.address);
      const shares = response.shares; // Accessing the "shares" property
      logger.info(`Shares: ${shares}`);
      return response;
    } catch (error) {
      logger.error("Error depositing collateral:", error);
      return error;
    }
  }

  async getAsset(
    wallet: Wallet,
    collateralTrackerContract: any
  ): Promise<any> {
    try {
      const tokenContract = new Contract(collateralTrackerContract, collateralTrackerAbi.abi, wallet);
      const response = await tokenContract.asset();
      logger.info(`Collateral token 0: ${response}`);
      return response;
    } catch (error) {
      logger.error("Error fetching collateral token 1:", error);
      return error;
    }
  }

  async getPoolData(
    wallet: Wallet,
    collateralTrackerContract: any
  ): Promise<any> {
    try {
      logger.info(`Attempting getPoolData on CollateralTracker...`)
      const CollateralTracker = new Contract(collateralTrackerContract, collateralTrackerAbi.abi, wallet);
      const response = await CollateralTracker.getPoolData();
      logger.info(`CollateralTracker getPoolData: ${response}`);
      return response;
    } catch (error) {
      logger.error("Error on getPoolData on CollateralTracker:", error);
      return error;
    }
  }

  async maxWithdraw(
    wallet: Wallet,
    collateralTrackerContract: any
  ): Promise<any> {
    try {
      logger.info(`Attempting token withdrawal...`)
      const tokenContract = new Contract(collateralTrackerContract, collateralTrackerAbi.abi, wallet);
      const asset = await tokenContract.asset();
      logger.info(`Collateral token asset: ${asset}`);
      logger.info(`Wallet: ${wallet.address}`);
      const response = await tokenContract.maxWithdraw(wallet.address);
      logger.info(`Withdrawal limit: ${response}`);
      return response;
    } catch (error) {
      logger.error("Error finding max withdrawal limit:", error);
      return error;
    }
  }

  async withdraw(
    wallet: Wallet,
    collateralTrackerContract: any,
    assets: BigNumber
  ): Promise<any> {
    try {
      logger.info(`Attempting token withdrawal...`)
      const tokenContract = new Contract(collateralTrackerContract, collateralTrackerAbi.abi, wallet);
      const asset = await tokenContract.asset();
      logger.info(`Collateral token asset: ${asset}`);
      logger.info(`Wallet: ${wallet.address}, Assets: ${assets}`);
      const response = await tokenContract.withdraw(
        assets,
        wallet.address,
        wallet.address,
        { gasLimit: this.gasLimitEstimate }
      );
      const shares = response.shares; // Accessing the "assets" property
      logger.info(`Assets: ${shares}`);
      return response;
    } catch (error) {
      logger.error("Error withdrawing collateral:", error);
      return error;
    }
  }

  // SemiFungiblePositionManager interactions

  async getAccountLiquidity(
    wallet: Wallet,
    univ3pool: BigNumber,
    owner: BigNumber,
    tokenType: BigNumber,
    tickLower: number,
    tickUpper: number
  ): Promise<any> {
    try {
      const semiFungiblePositionManager = this.SemiFungiblePositionManager;
      logger.info(`Checking getAccountLiquidity...`)
      const semiFungiblePositionManagerContract = new Contract(semiFungiblePositionManager, semiFungiblePositionManagerAbi.abi, wallet);
      const response = await semiFungiblePositionManagerContract.getAccountLiquidity(
        univ3pool,
        owner,
        tokenType,
        tickLower,
        tickUpper
      );
      logger.info(`getAccountLiquidity: ${response}`);
      return response;
    } catch (error) {
      logger.error("Error on getAccountLiquidity:", error);
      return error;
    }
  }

  async getAccountPremium(
    wallet: Wallet,
    univ3pool: BigNumber,
    owner: BigNumber,
    tokenType: BigNumber,
    tickLower: number,
    tickUpper: number,
    atTick: number,
    isLong: BigNumber
  ): Promise<any> {
    try {
      const semiFungiblePositionManager = this.SemiFungiblePositionManager;
      logger.info(`Checking getAccountPremium...`)
      const semiFungiblePositionManagerContract = new Contract(semiFungiblePositionManager, semiFungiblePositionManagerAbi.abi, wallet);
      const response = await semiFungiblePositionManagerContract.getAccountPremium(
        univ3pool,
        owner,
        tokenType,
        tickLower,
        tickUpper,
        atTick,
        isLong
      );
      logger.info(`getAccountPremium response: ${response}`);
      return response;
    } catch (error) {
      logger.error("Error on getAccountPremium:", error);
      return error;
    }
  }

  async getAccountFeesBase(
    wallet: Wallet,
    univ3pool: BigNumber,
    owner: BigNumber,
    tokenType: BigNumber,
    tickLower: number,
    tickUpper: number
  ): Promise<any> {
    try {
      const semiFungiblePositionManager = this.SemiFungiblePositionManager;
      logger.info(`Checking getAccountFeesBase...`)
      const semiFungiblePositionManagerContract = new Contract(semiFungiblePositionManager, semiFungiblePositionManagerAbi.abi, wallet);
      const response = await semiFungiblePositionManagerContract.getAccountFeesBase(
        univ3pool,
        owner,
        tokenType,
        tickLower,
        tickUpper
      );
      logger.info(`getAccountFeesBase response: ${response}`);
      return response;
    } catch (error) {
      logger.error("Error on getAccountFeesBase:", error);
      return error;
    }
  }

  // TokenIdLibrary interactions

  async addLeg(
    wallet: Wallet,
    self: BigNumber,
    legIndex: BigNumber,
    optionRatio: BigNumber, 
    asset: BigNumber,
    isLong: BigNumber,
    tokenType: BigNumber,
    riskPartner: BigNumber,
    strike: number,
    width: number
  ): Promise<any> {
    try {
      const tokenIdLibrary = this.TokenIdLibrary;
      logger.info(`Checking addLeg...`)
      const tokenIdLibraryContract = new Contract(tokenIdLibrary, tokenIdLibraryAbi.abi, wallet);
      const response = await tokenIdLibraryContract.addLeg(
        self,
        legIndex,
        optionRatio,
        asset,
        isLong,
        tokenType,
        riskPartner,
        strike,
        width
      );
      logger.info(`addLeg response: ${response}`);
      return response;
    } catch (error) {
      logger.error("Error on addLeg:", error);
      return error;
    }
  }

}
