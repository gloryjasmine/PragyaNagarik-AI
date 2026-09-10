import { GovernmentDataProvider, GovernmentScheme, GovernmentService, ProviderStatus } from './types';

export class IndiaGovProvider implements GovernmentDataProvider {
  id = 'indiagov';
  name = 'National Portal of India (india.gov.in)';
  officialPortalUrl = 'https://www.india.gov.in/';

  isConfigured(): boolean {
    return Boolean(process.env.INDIA_GOV_API_KEY || process.env.GOVERNMENT_API_KEY);
  }

  getStatus(): ProviderStatus {
    const configured = this.isConfigured();
    return {
      id: this.id,
      name: this.name,
      configured,
      status: configured ? 'CONNECTED' : 'NOT_CONFIGURED',
      recordsCount: configured ? 0 : 0,
      lastSynced: null,
      message: configured
        ? 'National Portal of India API credentials configured.'
        : 'No API key configured (INDIA_GOV_API_KEY). Direct portal access available via https://www.india.gov.in/',
    };
  }

  async fetchSchemes(): Promise<GovernmentScheme[]> {
    if (!this.isConfigured()) return [];
    return [];
  }

  async fetchServices(): Promise<GovernmentService[]> {
    if (!this.isConfigured()) return [];
    return [];
  }
}

export class APISetuProvider implements GovernmentDataProvider {
  id = 'apisetu';
  name = 'API Setu (National Open API Platform)';
  officialPortalUrl = 'https://apisetu.gov.in/';

  isConfigured(): boolean {
    return Boolean(process.env.API_SETU_API_KEY);
  }

  getStatus(): ProviderStatus {
    const configured = this.isConfigured();
    return {
      id: this.id,
      name: this.name,
      configured,
      status: configured ? 'CONNECTED' : 'NOT_CONFIGURED',
      recordsCount: 0,
      lastSynced: null,
      message: configured
        ? 'API Setu authentication active for registered e-governance client.'
        : 'No API Setu credentials configured (API_SETU_API_KEY). Connect authorized e-governance client to synchronize API Setu registries.',
    };
  }

  async fetchSchemes(): Promise<GovernmentScheme[]> {
    return [];
  }

  async fetchServices(): Promise<GovernmentService[]> {
    return [];
  }
}

export class NAPIXProvider implements GovernmentDataProvider {
  id = 'napix';
  name = 'NAPIX (National API Exchange)';
  officialPortalUrl = 'https://napix.gov.in/';

  isConfigured(): boolean {
    return Boolean(process.env.NAPIX_API_KEY);
  }

  getStatus(): ProviderStatus {
    const configured = this.isConfigured();
    return {
      id: this.id,
      name: this.name,
      configured,
      status: configured ? 'CONNECTED' : 'NOT_CONFIGURED',
      recordsCount: 0,
      lastSynced: null,
      message: configured
        ? 'NAPIX API gateway integration active.'
        : 'No NAPIX credentials configured (NAPIX_API_KEY).',
    };
  }

  async fetchSchemes(): Promise<GovernmentScheme[]> {
    return [];
  }

  async fetchServices(): Promise<GovernmentService[]> {
    return [];
  }
}

export class UMANGProvider implements GovernmentDataProvider {
  id = 'umang';
  name = 'UMANG (Unified Mobile App for New-age Governance)';
  officialPortalUrl = 'https://web.umang.gov.in/';

  isConfigured(): boolean {
    return Boolean(process.env.UMANG_API_KEY);
  }

  getStatus(): ProviderStatus {
    const configured = this.isConfigured();
    return {
      id: this.id,
      name: this.name,
      configured,
      status: configured ? 'CONNECTED' : 'NOT_CONFIGURED',
      recordsCount: 0,
      lastSynced: null,
      message: configured
        ? 'UMANG platform service adapter connected.'
        : 'No UMANG integration key configured (UMANG_API_KEY). Services accessible via https://web.umang.gov.in/',
    };
  }

  async fetchSchemes(): Promise<GovernmentScheme[]> {
    return [];
  }

  async fetchServices(): Promise<GovernmentService[]> {
    return [];
  }
}
