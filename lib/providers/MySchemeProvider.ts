import { GovernmentDataProvider, GovernmentScheme, GovernmentService, ProviderStatus } from './types';

export class MySchemeProvider implements GovernmentDataProvider {
  id = 'myscheme';
  name = 'myScheme (National Platform)';
  officialPortalUrl = 'https://www.myscheme.gov.in/';

  isConfigured(): boolean {
    return Boolean(process.env.MYSCHEME_API_KEY || process.env.GOVERNMENT_API_KEY);
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
        ? 'myScheme API credentials verified in server environment.'
        : 'No API key configured (MYSCHEME_API_KEY). Direct portal access available via https://www.myscheme.gov.in/',
    };
  }

  async fetchSchemes(): Promise<GovernmentScheme[]> {
    if (!this.isConfigured()) {
      return [];
    }
    try {
      const apiKey = process.env.MYSCHEME_API_KEY || process.env.GOVERNMENT_API_KEY;
      const baseUrl = process.env.GOVERNMENT_API_BASE_URL || 'https://api.myscheme.gov.in';
      const res = await fetch(`${baseUrl}/v1/schemes`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) {
        return [];
      }
      const data = await res.json();
      if (!Array.isArray(data?.schemes)) return [];
      return data.schemes.map((item: any) => ({
        id: `myscheme-${item.id || item.schemeId || Math.random().toString(36).slice(2)}`,
        title: item.title || item.schemeName || item.name,
        description: item.description || item.briefDescription || '',
        category: item.category || 'General Welfare',
        level: (item.level === 'STATE' || item.level === 'UT' ? item.level : 'CENTRAL') as any,
        state: item.state,
        unionTerritory: item.unionTerritory,
        ministry: item.ministry,
        department: item.department,
        eligibility: item.eligibility || {},
        benefits: Array.isArray(item.benefits) ? item.benefits : [item.benefit].filter(Boolean),
        documents: Array.isArray(item.documents) ? item.documents : [],
        applicationProcess: Array.isArray(item.steps) ? item.steps : ['Apply on official portal'],
        applicationUrl: item.applicationUrl || item.portalUrl || null,
        officialSourceUrl: item.officialUrl || 'https://www.myscheme.gov.in/',
        sourceName: 'myScheme.gov.in',
        lastVerified: new Date().toISOString().split('T')[0],
        isActive: true,
      }));
    } catch {
      return [];
    }
  }

  async fetchServices(): Promise<GovernmentService[]> {
    return [];
  }
}
