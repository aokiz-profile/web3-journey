import { CertificateType } from './config';

export interface CertificateMetadata {
  name: string;
  description: string;
  image: string;
  attributes: {
    trait_type: string;
    value: string | number;
  }[];
  certificate_type: CertificateType;
  issued_at: string;
  recipient_name: string;
  recipient_address: string;
  course_name: string;
  module_id?: string;
  project_id?: string;
  level?: string;
  completion_percentage: number;
}

export interface Certificate {
  tokenId: bigint;
  owner: string;
  metadata: CertificateMetadata;
  tokenURI: string;
  chainId: number;
}

export interface MintableCertificate {
  type: CertificateType;
  title: string;
  description: string;
  referenceId: string; // module id, project id, or level name
  completionPercentage: number;
  eligible: boolean;
  minted: boolean;
}
