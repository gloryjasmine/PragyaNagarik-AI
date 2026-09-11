import { Scheme, SchemeDocument } from '../types';
import {
  DataSyncSummary,
  GovernmentDataProvider,
  GovernmentLevel,
  GovernmentScheme,
  GovernmentService,
  ProviderStatus,
} from './types';
import { LocalVerifiedDatabaseProvider, VERIFIED_DATE } from './LocalVerifiedDatabaseProvider';
import { MySchemeProvider } from './MySchemeProvider';
import { APISetuProvider, IndiaGovProvider, NAPIXProvider, UMANGProvider } from './ExternalProviders';

export class GovernmentDataProviderManager {
  private static instance: GovernmentDataProviderManager;
  private providers: GovernmentDataProvider[] = [];
  private schemesCache: GovernmentScheme[] = [];
  private servicesCache: GovernmentService[] = [];
  private lastSynced: string = VERIFIED_DATE;
  private duplicatesRemovedCount: number = 0;

  private constructor() {
    this.registerProviders();
    // Synchronously initialize local verified records into cache
    this.initializeDefaultData();
  }

  public static getInstance(): GovernmentDataProviderManager {
    if (!GovernmentDataProviderManager.instance) {
      GovernmentDataProviderManager.instance = new GovernmentDataProviderManager();
    }
    return GovernmentDataProviderManager.instance;
  }

  private registerProviders(): void {
    this.providers = [
      new LocalVerifiedDatabaseProvider(),
      new MySchemeProvider(),
      new IndiaGovProvider(),
      new APISetuProvider(),
      new NAPIXProvider(),
      new UMANGProvider(),
    ];
  }

  private initializeDefaultData(): void {
    const localProvider = this.providers.find(p => p.id === 'local-verified-db') as LocalVerifiedDatabaseProvider;
    if (localProvider) {
      this.schemesCache = localProvider.getSchemesSync();
      this.servicesCache = localProvider.getServicesSync();
    }
  }

  public getProviders(): GovernmentDataProvider[] {
    return this.providers;
  }

  public getProviderStatuses(): ProviderStatus[] {
    return this.providers.map(p => {
      const status = p.getStatus();
      if (p.id === 'local-verified-db') {
        status.recordsCount = this.schemesCache.length + this.servicesCache.length;
      }
      return status;
    });
  }

  public async syncAll(): Promise<DataSyncSummary> {
    const allSchemes: GovernmentScheme[] = [];
    const allServices: GovernmentService[] = [];
    let dupsCount = 0;

    for (const provider of this.providers) {
      try {
        const schemes = await provider.fetchSchemes();
        const services = await provider.fetchServices();
        allSchemes.push(...schemes);
        allServices.push(...services);
      } catch (err) {
        console.error(`Error syncing provider ${provider.name}:`, err);
      }
    }

    // Deduplicate Schemes by normalized title & official URL
    const schemeMap = new Map<string, GovernmentScheme>();
    for (const s of allSchemes) {
      const key = `${s.title.toLowerCase().trim()}_${s.officialSourceUrl.toLowerCase().trim()}`;
      if (!schemeMap.has(key)) {
        schemeMap.set(key, s);
      } else {
        dupsCount++;
      }
    }

    // Deduplicate Services by normalized title & official URL
    const serviceMap = new Map<string, GovernmentService>();
    for (const s of allServices) {
      const key = `${s.title.toLowerCase().trim()}_${s.officialSourceUrl.toLowerCase().trim()}`;
      if (!serviceMap.has(key)) {
        serviceMap.set(key, s);
      } else {
        dupsCount++;
      }
    }

    this.schemesCache = Array.from(schemeMap.values());
    this.servicesCache = Array.from(serviceMap.values());
    this.lastSynced = new Date().toISOString();
    this.duplicatesRemovedCount = dupsCount;

    return this.getSyncSummary();
  }

  public getSyncSummary(): DataSyncSummary {
    const statesSet = new Set<string>();
    const utsSet = new Set<string>();

    [...this.schemesCache, ...this.servicesCache].forEach(item => {
      if (item.level === 'STATE' && item.state) statesSet.add(item.state);
      if (item.level === 'UT' && (item.unionTerritory || item.state)) {
        utsSet.add(item.unionTerritory || item.state || '');
      }
    });

    return {
      providers: this.getProviderStatuses(),
      totalSchemes: this.schemesCache.length,
      totalServices: this.servicesCache.length,
      totalRecords: this.schemesCache.length + this.servicesCache.length,
      duplicatesRemoved: this.duplicatesRemovedCount,
      lastSyncTimestamp: this.lastSynced,
      statesCount: statesSet.size,
      utsCount: utsSet.size,
    };
  }

  public getAllSchemes(): GovernmentScheme[] {
    return this.schemesCache;
  }

  public getAllServices(): GovernmentService[] {
    return this.servicesCache;
  }

  /**
   * Universal search and filter across Schemes and Services
   */
  public search({
    query = '',
    level = 'ALL',
    state,
    category,
    type = 'ALL',
  }: {
    query?: string;
    level?: string;
    state?: string;
    category?: string;
    type?: 'ALL' | 'SCHEME' | 'SERVICE';
  }): { schemes: GovernmentScheme[]; services: GovernmentService[]; total: number } {
    const q = query.toLowerCase().trim();

    let matchedSchemes = this.schemesCache;
    let matchedServices = this.servicesCache;

    if (type === 'SERVICE') {
      matchedSchemes = [];
    } else if (type === 'SCHEME') {
      matchedServices = [];
    }

    // Filter Schemes
    if (matchedSchemes.length > 0) {
      matchedSchemes = matchedSchemes.filter(s => {
        if (!s.isActive) return false;
        if (level !== 'ALL' && s.level !== level) return false;
        if (state && state !== 'All' && state !== 'All States/UTs') {
          if (s.level === 'CENTRAL') {
            // Central schemes are valid for all states
          } else if (s.state?.toLowerCase() !== state.toLowerCase() && s.unionTerritory?.toLowerCase() !== state.toLowerCase()) {
            return false;
          }
        }
        if (category && category !== 'All' && s.category.toLowerCase() !== category.toLowerCase()) {
          return false;
        }
        if (q) {
          const inTitle = s.title.toLowerCase().includes(q);
          const inDesc = s.description.toLowerCase().includes(q);
          const inCat = s.category.toLowerCase().includes(q);
          const inMin = s.ministry?.toLowerCase().includes(q) || s.department?.toLowerCase().includes(q);
          const inState = s.state?.toLowerCase().includes(q) || s.unionTerritory?.toLowerCase().includes(q);
          const inBenefits = s.benefits.some(b => b.toLowerCase().includes(q));
          return inTitle || inDesc || inCat || inMin || inState || inBenefits;
        }
        return true;
      });
    }

    // Filter Services
    if (matchedServices.length > 0) {
      matchedServices = matchedServices.filter(s => {
        if (!s.isActive) return false;
        if (level !== 'ALL' && s.level !== level) return false;
        if (state && state !== 'All' && state !== 'All States/UTs') {
          if (s.level === 'CENTRAL') {
            // Central services apply nationwide
          } else if (s.state?.toLowerCase() !== state.toLowerCase() && s.unionTerritory?.toLowerCase() !== state.toLowerCase()) {
            return false;
          }
        }
        if (category && category !== 'All' && s.category.toLowerCase() !== category.toLowerCase()) {
          return false;
        }
        if (q) {
          const inTitle = s.title.toLowerCase().includes(q);
          const inDesc = s.description.toLowerCase().includes(q);
          const inCat = s.category.toLowerCase().includes(q);
          const inDept = s.department?.toLowerCase().includes(q);
          const inState = s.state?.toLowerCase().includes(q) || s.unionTerritory?.toLowerCase().includes(q);
          return inTitle || inDesc || inCat || inDept || inState;
        }
        return true;
      });
    }

    return {
      schemes: matchedSchemes,
      services: matchedServices,
      total: matchedSchemes.length + matchedServices.length,
    };
  }

  /**
   * Convert GovernmentScheme to Scheme format for portal compatibility
   */
  public static toScheme(item: GovernmentScheme): Scheme {
    return {
      id: item.id,
      name: item.title,
      description: item.description,
      category: item.category,
      state: item.state || (item.level === 'CENTRAL' ? 'All India' : item.unionTerritory),
      state_ut: item.unionTerritory || item.state,
      government_level: item.level,
      scheme_service_type: 'SCHEME',
      department: item.department || item.ministry || 'Government of India',
      benefits: item.benefits,
      eligibility: item.eligibility,
      official_url: item.officialSourceUrl,
      application_url: item.applicationUrl || item.officialSourceUrl,
      information_status: 'Official Information',
      verification_status: 'Verified Government Source',
      last_verified_date: item.lastVerified,
      is_active: item.isActive,
      documents: item.documents.map(d => ({
        name: d.name,
        description: `${d.description}${d.issuingAuthority ? ` (Authority: ${d.issuingAuthority})` : ''}${d.digitalLockerAvailable ? ' [DigiLocker Available]' : ''}`,
      })),
    };
  }

  /**
   * Convert GovernmentService to Scheme format for portal compatibility
   */
  public static serviceToScheme(item: GovernmentService): Scheme {
    return {
      id: item.id,
      name: item.title,
      description: item.description,
      category: item.category,
      state: item.state || (item.level === 'CENTRAL' ? 'All India' : item.unionTerritory),
      state_ut: item.unionTerritory || item.state,
      government_level: item.level,
      scheme_service_type: 'SERVICE',
      department: item.department || 'Government Citizen Portal',
      benefits: item.process,
      eligibility: item.eligibility || { note: 'Open to all eligible citizens with valid identification' },
      official_url: item.officialSourceUrl,
      application_url: item.serviceUrl,
      information_status: 'Official Service',
      verification_status: 'Verified Government Portal',
      last_verified_date: item.lastVerified,
      is_active: item.isActive,
      documents: item.documents.map(d => ({
        name: d.name,
        description: `${d.description}${d.issuingAuthority ? ` (Authority: ${d.issuingAuthority})` : ''}${d.digitalLockerAvailable ? ' [DigiLocker Available]' : ''}`,
      })),
    };
  }

  /**
   * Get all items as unified Scheme[] list
   */
  public getAllAsUnifiedSchemes(): Scheme[] {
    const schemes = this.schemesCache.map(s => GovernmentDataProviderManager.toScheme(s));
    const services = this.servicesCache.map(s => GovernmentDataProviderManager.serviceToScheme(s));
    return [...schemes, ...services];
  }
}

export const providerManager = GovernmentDataProviderManager.getInstance();
