import { http, createConfig } from 'wagmi';
import { mainnet, sepolia, polygon, polygonAmoy } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

export const config = createConfig({
  chains: [mainnet, sepolia, polygon, polygonAmoy],
  connectors: [
    injected(),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [polygon.id]: http(),
    [polygonAmoy.id]: http(),
  },
});

// Certificate NFT Contract ABI (minimal interface for viewing)
export const CERTIFICATE_NFT_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'tokenOfOwnerByIndex',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'index', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'tokenURI',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    name: 'ownerOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    name: 'mint',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'certificateType', type: 'uint8' },
      { name: 'metadataURI', type: 'string' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

// Certificate contract addresses per chain (placeholder - deploy your own)
export const CERTIFICATE_CONTRACT_ADDRESSES: Record<number, `0x${string}` | undefined> = {
  [mainnet.id]: undefined, // Not deployed on mainnet
  [sepolia.id]: undefined, // Deploy and add address here
  [polygon.id]: undefined, // Not deployed on polygon
  [polygonAmoy.id]: undefined, // Deploy and add address here
};

// Certificate types
export enum CertificateType {
  MODULE_COMPLETION = 0,
  LEVEL_COMPLETION = 1,
  PROJECT_COMPLETION = 2,
  COURSE_COMPLETION = 3,
}

export const CERTIFICATE_TYPE_NAMES: Record<CertificateType, { zh: string; en: string }> = {
  [CertificateType.MODULE_COMPLETION]: { zh: '模块完成证书', en: 'Module Completion' },
  [CertificateType.LEVEL_COMPLETION]: { zh: '阶段完成证书', en: 'Level Completion' },
  [CertificateType.PROJECT_COMPLETION]: { zh: '项目完成证书', en: 'Project Completion' },
  [CertificateType.COURSE_COMPLETION]: { zh: '课程完成证书', en: 'Course Completion' },
};
