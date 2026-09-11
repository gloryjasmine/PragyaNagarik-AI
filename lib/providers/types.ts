export type GovernmentLevel = 'CENTRAL' | 'STATE' | 'UT';

export interface SchemeDocumentItem {
  name: string;
  description: string;
  optional?: boolean;
  issuingAuthority?: string;
  digitalLockerAvailable?: boolean;
}

export interface GovernmentScheme {
  id: string;
  title: string;
  description: string;
  category: string;
  level: GovernmentLevel;
  state?: string;
  unionTerritory?: string;
  ministry?: string;
  department?: string;
  eligibility: {
    occupations?: string[];
    minAge?: number;
    maxAge?: number;
    gender?: 'All' | 'Female' | 'Male' | 'Transgender';
    maxAnnualIncome?: number;
    socialCategories?: string[];
    residentialStatus?: string;
    landholdingLimitAcres?: number;
    customRules?: string[];
    [key: string]: any;
  };
  benefits: string[];
  documents: SchemeDocumentItem[];
  applicationProcess: string[];
  applicationUrl: string | null;
  officialSourceUrl: string;
  sourceName: string;
  lastVerified: string;
  languageData?: Record<string, { title?: string; description?: string; benefits?: string[] }>;
  isActive: boolean;
}

export interface GovernmentService {
  id: string;
  title: string;
  description: string;
  category: string;
  level: GovernmentLevel;
  state?: string;
  unionTerritory?: string;
  department?: string;
  eligibility?: Record<string, any>;
  documents: SchemeDocumentItem[];
  process: string[];
  serviceUrl: string;
  officialSourceUrl: string;
  sourceName: string;
  lastVerified: string;
  languageData?: Record<string, { title?: string; description?: string }>;
  isActive: boolean;
}

export interface ProviderStatus {
  id: string;
  name: string;
  configured: boolean;
  status: 'CONNECTED' | 'NOT_CONFIGURED' | 'ERROR';
  recordsCount: number;
  lastSynced: string | null;
  message: string;
}

export interface DataSyncSummary {
  providers: ProviderStatus[];
  totalSchemes: number;
  totalServices: number;
  totalRecords: number;
  duplicatesRemoved: number;
  lastSyncTimestamp: string;
  statesCount: number;
  utsCount: number;
}

export interface GovernmentDataProvider {
  id: string;
  name: string;
  officialPortalUrl: string;
  isConfigured(): boolean;
  getStatus(): ProviderStatus;
  fetchSchemes(): Promise<GovernmentScheme[]>;
  fetchServices(): Promise<GovernmentService[]>;
}
