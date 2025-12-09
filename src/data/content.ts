export type ModuleLevel = 'foundation' | 'development' | 'advanced' | 'expert';

export interface Resource {
  type: 'doc' | 'video' | 'article' | 'github';
  title: string;
  url: string;
}

export interface Topic {
  id: string;
  titleKey: string;
  descriptionKey?: string;
  resources?: Resource[];
}

export interface LearningModule {
  id: string;
  titleKey: string;
  descriptionKey: string;
  level: ModuleLevel;
  hours: number;
  topics: Topic[];
  icon: string;
  color: string;
  prerequisites?: string[]; // module ids
}

export const learningModules: LearningModule[] = [
  // Foundation Level
  {
    id: 'blockchain-basics',
    titleKey: 'modules.blockchainBasics.title',
    descriptionKey: 'modules.blockchainBasics.description',
    level: 'foundation',
    hours: 20,
    icon: 'cube',
    color: 'purple',
    topics: [
      {
        id: 'distributed-systems',
        titleKey: 'modules.blockchainBasics.topics.distributedSystems',
        descriptionKey: 'modules.blockchainBasics.topics.distributedSystemsDesc',
        resources: [
          { type: 'doc', title: 'MIT Distributed Systems', url: 'https://pdos.csail.mit.edu/6.824/' },
          { type: 'video', title: 'MIT 6.824 分布式系统', url: 'https://www.youtube.com/watch?v=cQP8WApzIQQ' },
          { type: 'video', title: '区块链底层技术 - 分布式系统基础', url: 'https://www.bilibili.com/video/BV1Vt411X7JF' },
        ],
      },
      {
        id: 'consensus-mechanisms',
        titleKey: 'modules.blockchainBasics.topics.consensusMechanisms',
        descriptionKey: 'modules.blockchainBasics.topics.consensusMechanismsDesc',
        resources: [
          { type: 'article', title: 'PoW vs PoS', url: 'https://ethereum.org/en/developers/docs/consensus-mechanisms/' },
          { type: 'video', title: '共识机制详解 - PoW vs PoS', url: 'https://www.youtube.com/watch?v=M3EFi_POhps' },
          { type: 'video', title: '拜占庭容错与共识算法', url: 'https://www.bilibili.com/video/BV1WJ411j7fS' },
        ],
      },
      {
        id: 'cryptography-basics',
        titleKey: 'modules.blockchainBasics.topics.cryptographyBasics',
        descriptionKey: 'modules.blockchainBasics.topics.cryptographyBasicsDesc',
        resources: [
          { type: 'doc', title: 'Cryptography Fundamentals', url: 'https://cryptobook.nakov.com/' },
          { type: 'video', title: '密码学入门 - 公钥密码学', url: 'https://www.youtube.com/watch?v=GSIDS_lvRv4' },
        ],
      },
      {
        id: 'hash-algorithms',
        titleKey: 'modules.blockchainBasics.topics.hashAlgorithms',
        descriptionKey: 'modules.blockchainBasics.topics.hashAlgorithmsDesc',
      },
      {
        id: 'merkle-trees',
        titleKey: 'modules.blockchainBasics.topics.merkleTrees',
        descriptionKey: 'modules.blockchainBasics.topics.merkleTreesDesc',
      },
    ],
  },
  {
    id: 'ethereum-fundamentals',
    titleKey: 'modules.ethereumFundamentals.title',
    descriptionKey: 'modules.ethereumFundamentals.description',
    level: 'foundation',
    hours: 15,
    icon: 'ethereum',
    color: 'blue',
    prerequisites: ['blockchain-basics'],
    topics: [
      {
        id: 'evm',
        titleKey: 'modules.ethereumFundamentals.topics.evm',
        descriptionKey: 'modules.ethereumFundamentals.topics.evmDesc',
        resources: [
          { type: 'doc', title: 'EVM Deep Dive', url: 'https://ethereum.org/en/developers/docs/evm/' },
          { type: 'article', title: 'Understanding EVM', url: 'https://www.evm.codes/' },
          { type: 'video', title: 'EVM 深度解析', url: 'https://www.youtube.com/watch?v=kCswGz9naZg' },
          { type: 'video', title: '以太坊虚拟机 EVM 原理详解', url: 'https://www.bilibili.com/video/BV1HP4y1W7Ep' },
        ],
      },
      {
        id: 'gas-mechanism',
        titleKey: 'modules.ethereumFundamentals.topics.gasMechanism',
        descriptionKey: 'modules.ethereumFundamentals.topics.gasMechanismDesc',
        resources: [
          { type: 'doc', title: 'Gas and Fees', url: 'https://ethereum.org/en/developers/docs/gas/' },
          { type: 'video', title: '以太坊 Gas 费用机制详解', url: 'https://www.youtube.com/watch?v=Yh8cHUB-KoU' },
        ],
      },
      {
        id: 'account-model',
        titleKey: 'modules.ethereumFundamentals.topics.accountModel',
        descriptionKey: 'modules.ethereumFundamentals.topics.accountModelDesc',
      },
      {
        id: 'transaction-structure',
        titleKey: 'modules.ethereumFundamentals.topics.transactionStructure',
        descriptionKey: 'modules.ethereumFundamentals.topics.transactionStructureDesc',
      },
    ],
  },
  {
    id: 'web3-ecosystem',
    titleKey: 'modules.web3Ecosystem.title',
    descriptionKey: 'modules.web3Ecosystem.description',
    level: 'foundation',
    hours: 10,
    icon: 'globe',
    color: 'cyan',
    topics: [
      {
        id: 'defi-overview',
        titleKey: 'modules.web3Ecosystem.topics.defiOverview',
        descriptionKey: 'modules.web3Ecosystem.topics.defiOverviewDesc',
        resources: [
          { type: 'doc', title: 'DeFi Llama', url: 'https://defillama.com/' },
          { type: 'article', title: 'DeFi Guide', url: 'https://ethereum.org/en/defi/' },
          { type: 'video', title: 'DeFi 去中心化金融完全指南', url: 'https://www.youtube.com/watch?v=H-O3r2YMWJ4' },
          { type: 'video', title: 'DeFi 入门教程：从零开始', url: 'https://www.bilibili.com/video/BV1564y1R7uB' },
        ],
      },
      {
        id: 'nft-overview',
        titleKey: 'modules.web3Ecosystem.topics.nftOverview',
        descriptionKey: 'modules.web3Ecosystem.topics.nftOverviewDesc',
        resources: [
          { type: 'video', title: 'NFT 是什么？完整入门指南', url: 'https://www.youtube.com/watch?v=Xdkkux6OxfM' },
          { type: 'video', title: 'NFT 技术原理与应用场景', url: 'https://www.bilibili.com/video/BV1XL4y1e7ue' },
        ],
      },
      {
        id: 'dao-overview',
        titleKey: 'modules.web3Ecosystem.topics.daoOverview',
        descriptionKey: 'modules.web3Ecosystem.topics.daoOverviewDesc',
      },
      {
        id: 'layer2-overview',
        titleKey: 'modules.web3Ecosystem.topics.layer2Overview',
        descriptionKey: 'modules.web3Ecosystem.topics.layer2OverviewDesc',
        resources: [
          { type: 'doc', title: 'L2Beat', url: 'https://l2beat.com/' },
        ],
      },
    ],
  },

  // Development Level
  {
    id: 'solidity-programming',
    titleKey: 'modules.solidityProgramming.title',
    descriptionKey: 'modules.solidityProgramming.description',
    level: 'development',
    hours: 40,
    icon: 'code',
    color: 'purple',
    prerequisites: ['ethereum-fundamentals'],
    topics: [
      {
        id: 'syntax-basics',
        titleKey: 'modules.solidityProgramming.topics.syntaxBasics',
        descriptionKey: 'modules.solidityProgramming.topics.syntaxBasicsDesc',
        resources: [
          { type: 'doc', title: 'Solidity Docs', url: 'https://docs.soliditylang.org/' },
          { type: 'article', title: 'Solidity by Example', url: 'https://solidity-by-example.org/' },
          { type: 'video', title: 'Solidity 智能合约开发入门', url: 'https://www.youtube.com/watch?v=gyMwXuJrbJQ' },
          { type: 'video', title: 'Solidity 从零到精通完整教程', url: 'https://www.bilibili.com/video/BV1Ca411n7ta' },
        ],
      },
      {
        id: 'data-types',
        titleKey: 'modules.solidityProgramming.topics.dataTypes',
        descriptionKey: 'modules.solidityProgramming.topics.dataTypesDesc',
      },
      {
        id: 'functions',
        titleKey: 'modules.solidityProgramming.topics.functions',
        descriptionKey: 'modules.solidityProgramming.topics.functionsDesc',
      },
      {
        id: 'inheritance',
        titleKey: 'modules.solidityProgramming.topics.inheritance',
        descriptionKey: 'modules.solidityProgramming.topics.inheritanceDesc',
      },
      {
        id: 'interfaces',
        titleKey: 'modules.solidityProgramming.topics.interfaces',
        descriptionKey: 'modules.solidityProgramming.topics.interfacesDesc',
      },
      {
        id: 'events-errors',
        titleKey: 'modules.solidityProgramming.topics.eventsErrors',
        descriptionKey: 'modules.solidityProgramming.topics.eventsErrorsDesc',
      },
    ],
  },
  {
    id: 'contract-security',
    titleKey: 'modules.contractSecurity.title',
    descriptionKey: 'modules.contractSecurity.description',
    level: 'development',
    hours: 25,
    icon: 'shield',
    color: 'red',
    prerequisites: ['solidity-programming'],
    topics: [
      {
        id: 'reentrancy',
        titleKey: 'modules.contractSecurity.topics.reentrancy',
        descriptionKey: 'modules.contractSecurity.topics.reentrancyDesc',
        resources: [
          { type: 'article', title: 'Reentrancy Attack', url: 'https://solidity-by-example.org/hacks/re-entrancy/' },
          { type: 'video', title: '重入攻击详解与防护', url: 'https://www.youtube.com/watch?v=4Mm3BCyHtDY' },
          { type: 'video', title: 'DeFi 安全：重入漏洞分析', url: 'https://www.bilibili.com/video/BV1Mb4y1f7wg' },
        ],
      },
      {
        id: 'overflow',
        titleKey: 'modules.contractSecurity.topics.overflow',
        descriptionKey: 'modules.contractSecurity.topics.overflowDesc',
      },
      {
        id: 'access-control',
        titleKey: 'modules.contractSecurity.topics.accessControl',
        descriptionKey: 'modules.contractSecurity.topics.accessControlDesc',
        resources: [
          { type: 'doc', title: 'OpenZeppelin Access', url: 'https://docs.openzeppelin.com/contracts/access-control' },
        ],
      },
      {
        id: 'audit-tools',
        titleKey: 'modules.contractSecurity.topics.auditTools',
        descriptionKey: 'modules.contractSecurity.topics.auditToolsDesc',
        resources: [
          { type: 'github', title: 'Slither', url: 'https://github.com/crytic/slither' },
          { type: 'github', title: 'Mythril', url: 'https://github.com/ConsenSys/mythril' },
        ],
      },
    ],
  },
  {
    id: 'dev-toolchain',
    titleKey: 'modules.devToolchain.title',
    descriptionKey: 'modules.devToolchain.description',
    level: 'development',
    hours: 20,
    icon: 'wrench',
    color: 'orange',
    prerequisites: ['solidity-programming'],
    topics: [
      {
        id: 'hardhat',
        titleKey: 'modules.devToolchain.topics.hardhat',
        descriptionKey: 'modules.devToolchain.topics.hardhatDesc',
        resources: [
          { type: 'doc', title: 'Hardhat Docs', url: 'https://hardhat.org/docs' },
          { type: 'video', title: 'Hardhat 完整开发教程', url: 'https://www.youtube.com/watch?v=GBc3lBrXEBo' },
          { type: 'video', title: 'Hardhat 智能合约开发实战', url: 'https://www.bilibili.com/video/BV1i34y1C7dL' },
        ],
      },
      {
        id: 'foundry',
        titleKey: 'modules.devToolchain.topics.foundry',
        descriptionKey: 'modules.devToolchain.topics.foundryDesc',
        resources: [
          { type: 'doc', title: 'Foundry Book', url: 'https://book.getfoundry.sh/' },
          { type: 'video', title: 'Foundry 框架入门到精通', url: 'https://www.youtube.com/watch?v=fNMfMxGxeag' },
          { type: 'video', title: 'Foundry vs Hardhat 对比实战', url: 'https://www.bilibili.com/video/BV1uD4y1o7wB' },
        ],
      },
      {
        id: 'remix',
        titleKey: 'modules.devToolchain.topics.remix',
        descriptionKey: 'modules.devToolchain.topics.remixDesc',
        resources: [
          { type: 'doc', title: 'Remix IDE', url: 'https://remix.ethereum.org/' },
        ],
      },
      {
        id: 'testing',
        titleKey: 'modules.devToolchain.topics.testing',
        descriptionKey: 'modules.devToolchain.topics.testingDesc',
      },
    ],
  },
  {
    id: 'frontend-integration',
    titleKey: 'modules.frontendIntegration.title',
    descriptionKey: 'modules.frontendIntegration.description',
    level: 'development',
    hours: 30,
    icon: 'layout',
    color: 'green',
    prerequisites: ['dev-toolchain'],
    topics: [
      {
        id: 'ethers-viem',
        titleKey: 'modules.frontendIntegration.topics.ethersViem',
        descriptionKey: 'modules.frontendIntegration.topics.ethersViemDesc',
        resources: [
          { type: 'doc', title: 'Viem Docs', url: 'https://viem.sh/' },
          { type: 'doc', title: 'Ethers.js', url: 'https://docs.ethers.org/' },
          { type: 'video', title: 'Ethers.js v6 完整教程', url: 'https://www.youtube.com/watch?v=yk7nVp5HTCk' },
          { type: 'video', title: 'Viem 库使用指南', url: 'https://www.bilibili.com/video/BV1Tc411R7Rd' },
        ],
      },
      {
        id: 'wagmi',
        titleKey: 'modules.frontendIntegration.topics.wagmi',
        descriptionKey: 'modules.frontendIntegration.topics.wagmiDesc',
        resources: [
          { type: 'doc', title: 'Wagmi Docs', url: 'https://wagmi.sh/' },
          { type: 'video', title: 'Wagmi + React DApp 开发教程', url: 'https://www.youtube.com/watch?v=CgXqKGXSdSs' },
        ],
      },
      {
        id: 'rainbowkit',
        titleKey: 'modules.frontendIntegration.topics.rainbowkit',
        descriptionKey: 'modules.frontendIntegration.topics.rainbowkitDesc',
        resources: [
          { type: 'doc', title: 'RainbowKit', url: 'https://www.rainbowkit.com/' },
        ],
      },
      {
        id: 'wallet-connection',
        titleKey: 'modules.frontendIntegration.topics.walletConnection',
        descriptionKey: 'modules.frontendIntegration.topics.walletConnectionDesc',
      },
    ],
  },

  // Advanced Level
  {
    id: 'defi-development',
    titleKey: 'modules.defiDevelopment.title',
    descriptionKey: 'modules.defiDevelopment.description',
    level: 'advanced',
    hours: 40,
    icon: 'trending',
    color: 'blue',
    prerequisites: ['frontend-integration', 'contract-security'],
    topics: [
      {
        id: 'amm',
        titleKey: 'modules.defiDevelopment.topics.amm',
        descriptionKey: 'modules.defiDevelopment.topics.ammDesc',
        resources: [
          { type: 'doc', title: 'Uniswap V3 Docs', url: 'https://docs.uniswap.org/' },
          { type: 'github', title: 'Uniswap V2 Core', url: 'https://github.com/Uniswap/v2-core' },
          { type: 'video', title: 'Uniswap V3 原理深度解析', url: 'https://www.youtube.com/watch?v=Ehm-OYBmlPM' },
          { type: 'video', title: 'AMM 做市商原理与实现', url: 'https://www.bilibili.com/video/BV1EW4y1g7wN' },
        ],
      },
      {
        id: 'lending-protocol',
        titleKey: 'modules.defiDevelopment.topics.lendingProtocol',
        descriptionKey: 'modules.defiDevelopment.topics.lendingProtocolDesc',
        resources: [
          { type: 'doc', title: 'Aave Docs', url: 'https://docs.aave.com/' },
          { type: 'doc', title: 'Compound Docs', url: 'https://docs.compound.finance/' },
        ],
      },
      {
        id: 'oracle-integration',
        titleKey: 'modules.defiDevelopment.topics.oracleIntegration',
        descriptionKey: 'modules.defiDevelopment.topics.oracleIntegrationDesc',
        resources: [
          { type: 'doc', title: 'Chainlink Docs', url: 'https://docs.chain.link/' },
        ],
      },
      {
        id: 'yield-strategies',
        titleKey: 'modules.defiDevelopment.topics.yieldStrategies',
        descriptionKey: 'modules.defiDevelopment.topics.yieldStrategiesDesc',
      },
    ],
  },
  {
    id: 'nft-development',
    titleKey: 'modules.nftDevelopment.title',
    descriptionKey: 'modules.nftDevelopment.description',
    level: 'advanced',
    hours: 25,
    icon: 'image',
    color: 'pink',
    prerequisites: ['frontend-integration'],
    topics: [
      {
        id: 'erc721',
        titleKey: 'modules.nftDevelopment.topics.erc721',
        descriptionKey: 'modules.nftDevelopment.topics.erc721Desc',
        resources: [
          { type: 'doc', title: 'ERC-721 Standard', url: 'https://eips.ethereum.org/EIPS/eip-721' },
          { type: 'doc', title: 'OpenZeppelin ERC721', url: 'https://docs.openzeppelin.com/contracts/erc721' },
          { type: 'video', title: 'ERC-721 NFT 合约开发教程', url: 'https://www.youtube.com/watch?v=2bjVWclBD_s' },
          { type: 'video', title: 'NFT 智能合约实战开发', url: 'https://www.bilibili.com/video/BV1wU4y1U7Qb' },
        ],
      },
      {
        id: 'erc1155',
        titleKey: 'modules.nftDevelopment.topics.erc1155',
        descriptionKey: 'modules.nftDevelopment.topics.erc1155Desc',
      },
      {
        id: 'metadata',
        titleKey: 'modules.nftDevelopment.topics.metadata',
        descriptionKey: 'modules.nftDevelopment.topics.metadataDesc',
      },
      {
        id: 'marketplace',
        titleKey: 'modules.nftDevelopment.topics.marketplace',
        descriptionKey: 'modules.nftDevelopment.topics.marketplaceDesc',
        resources: [
          { type: 'doc', title: 'OpenSea Docs', url: 'https://docs.opensea.io/' },
        ],
      },
    ],
  },
  {
    id: 'layer2-development',
    titleKey: 'modules.layer2Development.title',
    descriptionKey: 'modules.layer2Development.description',
    level: 'advanced',
    hours: 20,
    icon: 'layers',
    color: 'cyan',
    prerequisites: ['frontend-integration'],
    topics: [
      {
        id: 'optimism',
        titleKey: 'modules.layer2Development.topics.optimism',
        descriptionKey: 'modules.layer2Development.topics.optimismDesc',
        resources: [
          { type: 'doc', title: 'Optimism Docs', url: 'https://docs.optimism.io/' },
          { type: 'video', title: 'Optimism Layer2 原理讲解', url: 'https://www.youtube.com/watch?v=7pWxCklcNsU' },
        ],
      },
      {
        id: 'arbitrum',
        titleKey: 'modules.layer2Development.topics.arbitrum',
        descriptionKey: 'modules.layer2Development.topics.arbitrumDesc',
        resources: [
          { type: 'doc', title: 'Arbitrum Docs', url: 'https://docs.arbitrum.io/' },
        ],
      },
      {
        id: 'zksync',
        titleKey: 'modules.layer2Development.topics.zksync',
        descriptionKey: 'modules.layer2Development.topics.zksyncDesc',
        resources: [
          { type: 'doc', title: 'zkSync Docs', url: 'https://docs.zksync.io/' },
        ],
      },
    ],
  },
  {
    id: 'contract-upgrades',
    titleKey: 'modules.contractUpgrades.title',
    descriptionKey: 'modules.contractUpgrades.description',
    level: 'advanced',
    hours: 15,
    icon: 'refresh',
    color: 'purple',
    prerequisites: ['contract-security'],
    topics: [
      {
        id: 'proxy-patterns',
        titleKey: 'modules.contractUpgrades.topics.proxyPatterns',
        descriptionKey: 'modules.contractUpgrades.topics.proxyPatternsDesc',
        resources: [
          { type: 'doc', title: 'OpenZeppelin Upgrades', url: 'https://docs.openzeppelin.com/upgrades-plugins' },
        ],
      },
      {
        id: 'diamond-pattern',
        titleKey: 'modules.contractUpgrades.topics.diamondPattern',
        descriptionKey: 'modules.contractUpgrades.topics.diamondPatternDesc',
        resources: [
          { type: 'doc', title: 'EIP-2535', url: 'https://eips.ethereum.org/EIPS/eip-2535' },
        ],
      },
      {
        id: 'upgrade-safety',
        titleKey: 'modules.contractUpgrades.topics.upgradeSafety',
        descriptionKey: 'modules.contractUpgrades.topics.upgradeSafetyDesc',
      },
    ],
  },

  // Expert Level
  {
    id: 'mev-arbitrage',
    titleKey: 'modules.mevArbitrage.title',
    descriptionKey: 'modules.mevArbitrage.description',
    level: 'expert',
    hours: 20,
    icon: 'zap',
    color: 'yellow',
    prerequisites: ['defi-development'],
    topics: [
      {
        id: 'flashbots',
        titleKey: 'modules.mevArbitrage.topics.flashbots',
        descriptionKey: 'modules.mevArbitrage.topics.flashbotsDesc',
        resources: [
          { type: 'doc', title: 'Flashbots Docs', url: 'https://docs.flashbots.net/' },
        ],
      },
      {
        id: 'mev-protection',
        titleKey: 'modules.mevArbitrage.topics.mevProtection',
        descriptionKey: 'modules.mevArbitrage.topics.mevProtectionDesc',
      },
      {
        id: 'sandwich-attacks',
        titleKey: 'modules.mevArbitrage.topics.sandwichAttacks',
        descriptionKey: 'modules.mevArbitrage.topics.sandwichAttacksDesc',
      },
    ],
  },
  {
    id: 'crosschain-development',
    titleKey: 'modules.crosschainDevelopment.title',
    descriptionKey: 'modules.crosschainDevelopment.description',
    level: 'expert',
    hours: 25,
    icon: 'link',
    color: 'blue',
    prerequisites: ['layer2-development'],
    topics: [
      {
        id: 'bridge-protocols',
        titleKey: 'modules.crosschainDevelopment.topics.bridgeProtocols',
        descriptionKey: 'modules.crosschainDevelopment.topics.bridgeProtocolsDesc',
      },
      {
        id: 'crosschain-messaging',
        titleKey: 'modules.crosschainDevelopment.topics.crosschainMessaging',
        descriptionKey: 'modules.crosschainDevelopment.topics.crosschainMessagingDesc',
        resources: [
          { type: 'doc', title: 'LayerZero Docs', url: 'https://layerzero.gitbook.io/' },
          { type: 'doc', title: 'Axelar Docs', url: 'https://docs.axelar.dev/' },
        ],
      },
      {
        id: 'security-considerations',
        titleKey: 'modules.crosschainDevelopment.topics.securityConsiderations',
        descriptionKey: 'modules.crosschainDevelopment.topics.securityConsiderationsDesc',
      },
    ],
  },
  {
    id: 'zk-applications',
    titleKey: 'modules.zkApplications.title',
    descriptionKey: 'modules.zkApplications.description',
    level: 'expert',
    hours: 40,
    icon: 'lock',
    color: 'green',
    prerequisites: ['layer2-development'],
    topics: [
      {
        id: 'zk-basics',
        titleKey: 'modules.zkApplications.topics.zkBasics',
        descriptionKey: 'modules.zkApplications.topics.zkBasicsDesc',
        resources: [
          { type: 'doc', title: 'ZK Learning', url: 'https://zkhack.dev/zkleaning/' },
          { type: 'video', title: '零知识证明入门教程', url: 'https://www.youtube.com/watch?v=fOGdb1CTu5c' },
          { type: 'video', title: 'ZK-SNARK 原理详解', url: 'https://www.bilibili.com/video/BV1TV4y1M7uu' },
        ],
      },
      {
        id: 'circom',
        titleKey: 'modules.zkApplications.topics.circom',
        descriptionKey: 'modules.zkApplications.topics.circomDesc',
        resources: [
          { type: 'doc', title: 'Circom Docs', url: 'https://docs.circom.io/' },
        ],
      },
      {
        id: 'zk-use-cases',
        titleKey: 'modules.zkApplications.topics.zkUseCases',
        descriptionKey: 'modules.zkApplications.topics.zkUseCasesDesc',
      },
      {
        id: 'zk-rollups',
        titleKey: 'modules.zkApplications.topics.zkRollups',
        descriptionKey: 'modules.zkApplications.topics.zkRollupsDesc',
      },
    ],
  },
];

export const getModulesByLevel = (level: ModuleLevel) =>
  learningModules.filter((m) => m.level === level);

export const getModuleById = (id: string) =>
  learningModules.find((m) => m.id === id);

export const getTotalHours = () =>
  learningModules.reduce((acc, m) => acc + m.hours, 0);

export const getTotalTopics = () =>
  learningModules.reduce((acc, m) => acc + m.topics.length, 0);

export const getModuleDependencies = (moduleId: string): LearningModule[] => {
  const module = getModuleById(moduleId);
  if (!module?.prerequisites) return [];
  return module.prerequisites
    .map((id) => getModuleById(id))
    .filter((m): m is LearningModule => m !== undefined);
};
