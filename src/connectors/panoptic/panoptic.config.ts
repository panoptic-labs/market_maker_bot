import { AvailableNetworks } from '../../services/config-manager-types';
import { ConfigManagerV2 } from '../../services/config-manager-v2';

export namespace PanopticConfig {
  export interface NetworkConfig {
    allowedSlippage: string;
    gasLimitEstimate: number;
    gasFactor: number; 
    ttl: number;
    subgraphUrl: string;
    lowestTick: number;
    highestTick: number;
    multiCallAddress: (chain: string, network: string) => string;
    UniswapV3Factory: (chain: string, network: string) => string;
    NonFungiblePositionManager: (chain: string, network: string) => string;
    SemiFungiblePositionManager: (chain: string, network: string) => string;
    PanopticFactory: (chain: string, network: string) => string;
    PanopticHelper: (chain: string, network: string) => string;
    UniswapMigrator: (chain: string, network: string) => string;
    PanopticPool: (chain: string, network: string) => string;
    TokenIdLibrary: (chain: string, network: string) => string;
    tradingTypes: Array<string>;
    chainType: string;
    availableNetworks: Array<AvailableNetworks>;
  }

  export const config: NetworkConfig = {
    allowedSlippage: ConfigManagerV2.getInstance().get('panoptic.allowedSlippage'),
    gasFactor: ConfigManagerV2.getInstance().get('panoptic.gasFactor'),
    gasLimitEstimate: ConfigManagerV2.getInstance().get(`panoptic.gasLimitEstimate`),
    ttl: ConfigManagerV2.getInstance().get('panoptic.ttl'),
    subgraphUrl: ConfigManagerV2.getInstance().get('panoptic.subgraph.endpoint'),
    lowestTick: ConfigManagerV2.getInstance().get('panoptic.lowestTick'),
    highestTick: ConfigManagerV2.getInstance().get('panoptic.highestTick'),
    multiCallAddress: (chain: string, network: string) =>
      ConfigManagerV2.getInstance().get(
        'panoptic.contractAddresses.' +
        chain +
        '.' +
        network +
        '.multiCallAddress'
      ),
    UniswapV3Factory: (chain: string, network: string) =>
      ConfigManagerV2.getInstance().get(
        'panoptic.contractAddresses.' +
        chain +
        '.' +
        network +
        '.UniswapV3Factory'
      ),
    NonFungiblePositionManager: (chain: string, network: string) =>
      ConfigManagerV2.getInstance().get(
        'panoptic.contractAddresses.' +
        chain +
        '.' +
        network +
        '.NonFungiblePositionManager'
      ),
    SemiFungiblePositionManager: (chain: string, network: string) =>
      ConfigManagerV2.getInstance().get(
        'panoptic.contractAddresses.' +
        chain +
        '.' +
        network +
        '.SemiFungiblePositionManager'
      ),
    PanopticFactory: (chain: string, network: string) =>
      ConfigManagerV2.getInstance().get(
        'panoptic.contractAddresses.' +
        chain +
        '.' +
        network +
        '.PanopticFactory'
      ),
    PanopticHelper: (chain: string, network: string) =>
      ConfigManagerV2.getInstance().get(
        'panoptic.contractAddresses.' +
        chain +
        '.' +
        network +
        '.PanopticHelper'
      ),
    UniswapMigrator: (chain: string, network: string) =>
      ConfigManagerV2.getInstance().get(
        'panoptic.contractAddresses.' +
        chain +
        '.' +
        network +
        '.UniswapMigrator'
      ),
    PanopticPool: (chain: string, network: string) =>
      ConfigManagerV2.getInstance().get(
        'panoptic.contractAddresses.' +
        chain +
        '.' +
        network +
        '.PanopticPool'
      ),
    TokenIdLibrary: (chain: string, network: string) =>
      ConfigManagerV2.getInstance().get(
        'panoptic.contractAddresses.' +
        chain +
        '.' +
        network +
        '.TokenIdLibrary'
      ),
    tradingTypes: ['AMM'],
    chainType: 'EVM',
    availableNetworks: [
      { chain: 'ethereum', networks: ['sepolia'] },
    ],
  };
}
