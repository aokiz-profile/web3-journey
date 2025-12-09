export type ProjectDifficulty = 'beginner' | 'elementary' | 'intermediate' | 'advanced' | 'expert';

export interface ProjectStep {
  titleKey: string;
  descriptionKey: string;
}

export interface ProjectResource {
  type: 'doc' | 'video' | 'github' | 'article';
  title: string;
  url: string;
}

export interface Project {
  id: string;
  titleKey: string;
  descriptionKey: string;
  difficulty: ProjectDifficulty;
  skills: string[];
  estimatedHours: number;
  githubUrl?: string;
  demoUrl?: string;
  prerequisites?: string[]; // module ids
  steps?: ProjectStep[];
  resources?: ProjectResource[];
}

export const projects: Project[] = [
  // Beginner
  {
    id: 'erc20-token',
    titleKey: 'projects.list.erc20.title',
    descriptionKey: 'projects.list.erc20.description',
    difficulty: 'beginner',
    skills: ['Solidity Basics', 'Contract Deployment'],
    estimatedHours: 4,
    prerequisites: ['solidity-programming'],
    resources: [
      { type: 'doc', title: 'OpenZeppelin ERC20', url: 'https://docs.openzeppelin.com/contracts/erc20' },
      { type: 'article', title: 'ERC20 Standard', url: 'https://eips.ethereum.org/EIPS/eip-20' },
    ],
  },
  {
    id: 'voting-contract',
    titleKey: 'projects.list.voting.title',
    descriptionKey: 'projects.list.voting.description',
    difficulty: 'beginner',
    skills: ['State Management', 'Events'],
    estimatedHours: 6,
    prerequisites: ['solidity-programming'],
    resources: [
      { type: 'article', title: 'Solidity by Example - Voting', url: 'https://solidity-by-example.org/app/ballot/' },
    ],
  },

  // Elementary
  {
    id: 'nft-mint-page',
    titleKey: 'projects.list.nftMint.title',
    descriptionKey: 'projects.list.nftMint.description',
    difficulty: 'elementary',
    skills: ['ERC-721', 'Frontend Integration'],
    estimatedHours: 10,
    prerequisites: ['solidity-programming', 'frontend-integration'],
    resources: [
      { type: 'doc', title: 'OpenZeppelin ERC721', url: 'https://docs.openzeppelin.com/contracts/erc721' },
      { type: 'doc', title: 'Wagmi useContractWrite', url: 'https://wagmi.sh/react/hooks/useWriteContract' },
    ],
  },
  {
    id: 'multisig-wallet',
    titleKey: 'projects.list.multisig.title',
    descriptionKey: 'projects.list.multisig.description',
    difficulty: 'elementary',
    skills: ['Access Control', 'Security'],
    estimatedHours: 12,
    prerequisites: ['solidity-programming', 'contract-security'],
    resources: [
      { type: 'article', title: 'Solidity by Example - Multi-Sig Wallet', url: 'https://solidity-by-example.org/app/multi-sig-wallet/' },
      { type: 'github', title: 'Gnosis Safe Contracts', url: 'https://github.com/safe-global/safe-contracts' },
    ],
  },

  // Intermediate
  {
    id: 'dex-interface',
    titleKey: 'projects.list.dex.title',
    descriptionKey: 'projects.list.dex.description',
    difficulty: 'intermediate',
    skills: ['AMM Understanding', 'Liquidity'],
    estimatedHours: 20,
    prerequisites: ['frontend-integration', 'defi-development'],
    resources: [
      { type: 'doc', title: 'Uniswap SDK', url: 'https://docs.uniswap.org/sdk/v3/overview' },
      { type: 'github', title: 'Uniswap Interface', url: 'https://github.com/Uniswap/interface' },
    ],
  },
  {
    id: 'nft-marketplace',
    titleKey: 'projects.list.nftMarket.title',
    descriptionKey: 'projects.list.nftMarket.description',
    difficulty: 'intermediate',
    skills: ['Auction', 'Royalties'],
    estimatedHours: 25,
    prerequisites: ['nft-development', 'frontend-integration'],
    resources: [
      { type: 'doc', title: 'OpenSea Developer Docs', url: 'https://docs.opensea.io/' },
      { type: 'article', title: 'EIP-2981 Royalty Standard', url: 'https://eips.ethereum.org/EIPS/eip-2981' },
    ],
  },

  // Advanced
  {
    id: 'lending-protocol',
    titleKey: 'projects.list.lending.title',
    descriptionKey: 'projects.list.lending.description',
    difficulty: 'advanced',
    skills: ['Interest Rate Model', 'Liquidation'],
    estimatedHours: 40,
    prerequisites: ['defi-development', 'contract-security'],
    resources: [
      { type: 'doc', title: 'Aave V3 Docs', url: 'https://docs.aave.com/developers/getting-started/readme' },
      { type: 'github', title: 'Compound Protocol', url: 'https://github.com/compound-finance/compound-protocol' },
    ],
  },
  {
    id: 'dao-governance',
    titleKey: 'projects.list.dao.title',
    descriptionKey: 'projects.list.dao.description',
    difficulty: 'advanced',
    skills: ['Voting', 'Proposals', 'Timelock'],
    estimatedHours: 35,
    prerequisites: ['solidity-programming', 'contract-security'],
    resources: [
      { type: 'doc', title: 'OpenZeppelin Governor', url: 'https://docs.openzeppelin.com/contracts/governance' },
      { type: 'github', title: 'Compound Governance', url: 'https://github.com/compound-finance/compound-governance' },
    ],
  },

  // Expert
  {
    id: 'crosschain-bridge',
    titleKey: 'projects.list.bridge.title',
    descriptionKey: 'projects.list.bridge.description',
    difficulty: 'expert',
    skills: ['Cross-chain Messaging', 'Security'],
    estimatedHours: 50,
    prerequisites: ['crosschain-development', 'contract-security'],
    resources: [
      { type: 'doc', title: 'LayerZero Docs', url: 'https://layerzero.gitbook.io/docs/' },
      { type: 'doc', title: 'Axelar Docs', url: 'https://docs.axelar.dev/' },
    ],
  },
];

export const getProjectById = (id: string) => projects.find((p) => p.id === id);

export const getProjectsByDifficulty = (difficulty: ProjectDifficulty) =>
  projects.filter((p) => p.difficulty === difficulty);

export const getDifficultyStars = (difficulty: ProjectDifficulty): number => {
  const map: Record<ProjectDifficulty, number> = {
    beginner: 1,
    elementary: 2,
    intermediate: 3,
    advanced: 4,
    expert: 5,
  };
  return map[difficulty];
};

export const getDifficultyColor = (difficulty: ProjectDifficulty): string => {
  const map: Record<ProjectDifficulty, string> = {
    beginner: 'green',
    elementary: 'blue',
    intermediate: 'yellow',
    advanced: 'orange',
    expert: 'red',
  };
  return map[difficulty];
};
