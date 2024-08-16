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
import panopticPoolAbi from './panoptic_panopticpool_abi.json';
import collateralTrackerAbi from './panoptic_collateraltracker_abi.json';

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
  private _PanopticPool: string; 
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
    this._PanopticPool = config.PanopticPool(chain, network); 
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
  public get PanopticPool(): string {
    return this._PanopticPool;
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
    return this._chain;
  }

  async executeMint(
    wallet: Wallet,
    positionIdList: BigNumber[],
    positionSize: BigNumber,
    effectiveLiquidityLimit: BigNumber,
    tickLimitLow: number = -887272,
    tickLimitHigh: number = 887272
  ): Promise<any> {
    try {
      const panopticpool = this.PanopticPool; 
      logger.info(`Attempting option mint on contract ${panopticpool}...`);
      const panopticContract = new Contract(panopticpool, panopticPoolAbi.abi, wallet);

      // Call the mintOption function
      const tx = await panopticContract.mintOptions(
        positionIdList, 
        positionSize, 
        effectiveLiquidityLimit,
        tickLimitLow, 
        tickLimitHigh,
        { gasLimit: 10000000 }
      );
      logger.info("Transaction submitted:", tx.hash);
      // Wait for the transaction to be mined
      const receipt = await tx.wait();
      logger.info("Transaction mined:", receipt.transactionHash);
      return { hash: tx.hash, nonce: tx.nonce };

    } catch (error) {
      logger.error("Error minting option:", error);
      return error;
    }
  }

  async executeBurn(
    wallet: Wallet,
    burnTokenId: BigNumber,
    newPositionIdList: BigNumber[],
    tickLimitLow: number = -887272,
    tickLimitHigh: number = 887272
  ): Promise<any> {
    try {
      const panopticpool = this.PanopticPool; 
      logger.info(`Attempting option burn on contract ${panopticpool}...`);
      const panopticContract = new Contract(panopticpool, panopticPoolAbi.abi, wallet);

      // Call the burnOption function
      const tx = await panopticContract["burnOptions(uint256,uint256[],int24,int24)"](
        burnTokenId, 
        newPositionIdList, 
        tickLimitLow,
        tickLimitHigh,
        { gasLimit: 10000000 }
      );
      logger.info("Transaction submitted:", tx.hash);
      // Wait for the transaction to be mined
      const receipt = await tx.wait();
      logger.info("Transaction mined:", receipt.transactionHash);
      return { txHash: tx.hash };

    } catch (error) {
      logger.error("Error burning option:", error);
      return error;
    }
  }

  async collateralToken0(wallet: Wallet): Promise<any> {
    try {
      const panopticpool = this.PanopticPool; 
      logger.info(`Fetching CollateralTracker for token 0 from contract ${panopticpool}...`);
      const panopticContract = new Contract(panopticpool, panopticPoolAbi.abi, wallet);

      // Call the collateralToken0 function
      const tx = await panopticContract.collateralToken0();
      logger.info(`CollateralTracker contract for token 0: ${tx}`);

      const tokenContract = new Contract(tx, collateralTrackerAbi.abi, wallet);
      const asset = await tokenContract.asset();
      logger.info(`Collateral token 0: ${asset}`);

      const symbol = await tokenContract.symbol();
      logger.info(`Symbol token 0: ${symbol}`);

      return tx;

    } catch (error) {
      logger.error("Error fetching collateral token 0:", error);
      return error;
    }
  }

  async collateralToken1(wallet: Wallet): Promise<any> {
    try {
      const panopticpool = this.PanopticPool; 
      logger.info(`Fetching CollateralTracker for token 1 from contract ${panopticpool}...`);
      const panopticContract = new Contract(panopticpool, panopticPoolAbi.abi, wallet);

      // Call the collateralToken1 function
      const tx = await panopticContract.collateralToken1();
      return tx;

    } catch (error) {
      logger.error("Error fetching collateral token 1:", error);
      return error;
    }
  }

  async getAsset(wallet: Wallet, collateralTrackerContract: any): Promise<any> {
    try {
      const tokenContract = new Contract(collateralTrackerContract, collateralTrackerAbi.abi, wallet);
      const asset = await tokenContract.asset();
      logger.info(`Collateral token 0: ${asset}`);

      return asset; 

    } catch (error) {
      logger.error("Error fetching collateral token 1:", error);
      return error;
    }
  }

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
      const depositEvent = await tokenContract.deposit(assets, wallet.address);
      const shares = depositEvent.shares; // Accessing the "shares" property
      logger.info(`Shares: ${shares}`);

      return shares; 

    } catch (error) {
      logger.error("Error depositing collateral:", error);
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
      const withdrawEvent = await tokenContract.withdraw(assets, wallet.address, wallet.address, { gasLimit: 10000000 });
      const shares = withdrawEvent.shares; // Accessing the "assets" property
      logger.info(`Assets: ${shares}`);

      return shares; 

    } catch (error) {
      logger.error("Error withdrawing collateral:", error);
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
      const withdrawLimit = await tokenContract.maxWithdraw(wallet.address);
      logger.info(`Withdrawal limit: ${withdrawLimit}`);

      return withdrawLimit; 

    } catch (error) {
      logger.error("Error finding max withdrawal limit:", error);
      return error;
    }
  }

  async numberOfPositions(
    wallet: Wallet
  ): Promise<any> {
    try {
      const panopticpool = this.PanopticPool; 
      logger.info(`Querying open positions...`)
      const panopticContract = new Contract(panopticpool, panopticPoolAbi.abi, wallet);

      const positions = await panopticContract.numberOfPositions(wallet.address);
      return positions;

    } catch (error) {
      logger.error("Error querying open positions:", error);
      return error;
    }
  }

}