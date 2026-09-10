import { Scheme } from '../types';
import { providerManager } from '../providers/GovernmentDataProviderManager';
import { VERIFIED_DATE } from '../providers/LocalVerifiedDatabaseProvider';

export const OFFICIAL_DIRECTORY = 'https://www.india.gov.in/services/state';
export const VERIFIED_ON = VERIFIED_DATE;

export interface JurisdictionMeta {
  name: string;
  level: 'STATE' | 'UT';
  portalUrl: string;
  portalName: string;
}

export const JURISDICTION_METAS: JurisdictionMeta[] = [
  // 28 States
  { name: 'Andhra Pradesh', level: 'STATE', portalUrl: 'https://ap.meeseva.gov.in/', portalName: 'AP MeeSeva & Navasakam Portal' },
  { name: 'Arunachal Pradesh', level: 'STATE', portalUrl: 'https://eservice.arunachal.gov.in/', portalName: 'eService Arunachal' },
  { name: 'Assam', level: 'STATE', portalUrl: 'https://sewasetu.assam.gov.in/', portalName: 'Sewa Setu Citizen Portal' },
  { name: 'Bihar', level: 'STATE', portalUrl: 'https://serviceonline.bihar.gov.in/', portalName: 'RTPS Bihar Citizen Portal' },
  { name: 'Chhattisgarh', level: 'STATE', portalUrl: 'https://edistrict.cgstate.gov.in/', portalName: 'e-District Chhattisgarh' },
  { name: 'Goa', level: 'STATE', portalUrl: 'https://goaonline.gov.in/', portalName: 'Goa Online Single Window Portal' },
  { name: 'Gujarat', level: 'STATE', portalUrl: 'https://www.digitalgujarat.gov.in/', portalName: 'Digital Gujarat Citizen Portal' },
  { name: 'Haryana', level: 'STATE', portalUrl: 'https://saralharyana.gov.in/', portalName: 'Antyodaya SARAL Haryana' },
  { name: 'Himachal Pradesh', level: 'STATE', portalUrl: 'https://edistrict.hp.gov.in/', portalName: 'e-District Himachal Pradesh' },
  { name: 'Jharkhand', level: 'STATE', portalUrl: 'https://jharsewa.jharkhand.gov.in/', portalName: 'JharSewa Jharkhand' },
  { name: 'Karnataka', level: 'STATE', portalUrl: 'https://sevasindhu.karnataka.gov.in/', portalName: 'Karnataka Seva Sindhu' },
  { name: 'Kerala', level: 'STATE', portalUrl: 'https://edistrict.kerala.gov.in/', portalName: 'Kerala e-District Portal' },
  { name: 'Madhya Pradesh', level: 'STATE', portalUrl: 'https://mpedistrict.gov.in/', portalName: 'MP e-District Citizen Services' },
  { name: 'Maharashtra', level: 'STATE', portalUrl: 'https://aaplesarkar.mahaonline.gov.in/', portalName: 'Maharashtra Aaple Sarkar' },
  { name: 'Manipur', level: 'STATE', portalUrl: 'https://eservicesmanipur.gov.in/', portalName: 'e-Services Manipur' },
  { name: 'Meghalaya', level: 'STATE', portalUrl: 'https://megedistrict.gov.in/', portalName: 'Meghalaya e-District' },
  { name: 'Mizoram', level: 'STATE', portalUrl: 'https://edistrict.mizoram.gov.in/', portalName: 'Mizoram e-District Portal' },
  { name: 'Nagaland', level: 'STATE', portalUrl: 'https://edistrict.nagaland.gov.in/', portalName: 'Nagaland e-District Services' },
  { name: 'Odisha', level: 'STATE', portalUrl: 'https://odishaone.gov.in/', portalName: 'Odisha One Citizen Portal' },
  { name: 'Punjab', level: 'STATE', portalUrl: 'https://dgrpg.punjab.gov.in/', portalName: 'Punjab Sewa Kendra Portal' },
  { name: 'Rajasthan', level: 'STATE', portalUrl: 'https://emitra.rajasthan.gov.in/', portalName: 'Rajasthan e-Mitra Portal' },
  { name: 'Sikkim', level: 'STATE', portalUrl: 'https://sikkim.gov.in/', portalName: 'Sikkim State Citizen Portal' },
  { name: 'Tamil Nadu', level: 'STATE', portalUrl: 'https://www.tnesevai.tn.gov.in/', portalName: 'Tamil Nadu e-Sevai (TNeGA)' },
  { name: 'Telangana', level: 'STATE', portalUrl: 'https://ts.meeseva.telangana.gov.in/', portalName: 'Telangana MeeSeva Portal' },
  { name: 'Tripura', level: 'STATE', portalUrl: 'https://edistrict.tripura.gov.in/', portalName: 'Tripura e-District Portal' },
  { name: 'Uttar Pradesh', level: 'STATE', portalUrl: 'https://esathi.up.gov.in/', portalName: 'UP e-Sathi Citizen Portal' },
  { name: 'Uttarakhand', level: 'STATE', portalUrl: 'https://eservices.uk.gov.in/', portalName: 'e-Services Uttarakhand (Apuni Sarkar)' },
  { name: 'West Bengal', level: 'STATE', portalUrl: 'https://edistrict.wb.gov.in/', portalName: 'West Bengal e-District & Duare Sarkar' },

  // 8 Union Territories
  { name: 'Andaman and Nicobar Islands', level: 'UT', portalUrl: 'https://edistrict.andaman.gov.in/', portalName: 'Andaman e-District Portal' },
  { name: 'Chandigarh', level: 'UT', portalUrl: 'https://chdservices.gov.in/', portalName: 'Chandigarh Administration e-Services' },
  { name: 'Dadra and Nagar Haveli and Daman and Diu', level: 'UT', portalUrl: 'https://edistrict.ddd.gov.in/', portalName: 'DNH & DD e-District Portal' },
  { name: 'Delhi', level: 'UT', portalUrl: 'https://edistrict.delhigovt.nic.in/', portalName: 'Delhi e-District Citizen Services' },
  { name: 'Jammu and Kashmir', level: 'UT', portalUrl: 'https://eunnat.jk.gov.in/', portalName: 'J&K e-UNNAT (Jan Sugam)' },
  { name: 'Ladakh', level: 'UT', portalUrl: 'https://edistrict.ladakh.gov.in/', portalName: 'Ladakh e-District Portal' },
  { name: 'Lakshadweep', level: 'UT', portalUrl: 'https://edistrict.utl.gov.in/', portalName: 'Lakshadweep e-Services Portal' },
  { name: 'Puducherry', level: 'UT', portalUrl: 'https://edistrict.py.gov.in/', portalName: 'Puducherry e-District Portal' },
];

export const JURISDICTIONS: [string, 'STATE' | 'UT'][] = JURISDICTION_METAS.map(m => [m.name, m.level]);

function getJurisdictionDirectories(): Scheme[] {
  return JURISDICTION_METAS.map(meta => {
    const slug = meta.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return {
      id: `state-portal-${slug}`,
      name: `${meta.name} - ${meta.portalName}`,
      description: `Official state public service directory and online citizen application portal for ${meta.name}, providing verified revenue certificates, civil registrations, welfare scheme linkages, and social security administration.`,
      category: 'State Citizen Services',
      benefits: [
        'Official service discovery and direct online application',
        `Direct access to ${meta.name} government departments`,
        'Time-bound citizen charter delivery under Right to Public Services',
        'Direct linkage to verified state welfare schemes',
      ],
      eligibility: {
        residentialStatus: `Resident / Domicile of ${meta.name}`,
        note: `Applicant must be an ordinary resident or native of ${meta.name} with appropriate address verification.`,
      },
      official_url: meta.portalUrl,
      application_url: meta.portalUrl,
      state: meta.name,
      state_ut: meta.name,
      government_level: meta.level,
      scheme_service_type: 'SERVICE',
      department: `Government of ${meta.name}`,
      information_status: 'Official Directory',
      verification_status: 'Verified Government Source',
      last_verified_date: VERIFIED_ON,
      is_active: true,
      documents: [
        { name: 'Aadhaar Card', description: 'Resident verification for citizen services' },
        { name: 'Domicile / Residence Certificate', description: `Official proof of residence within ${meta.name}` },
      ],
    };
  });
}

function buildUnifiedCatalogue(): Scheme[] {
  // 1. Get all schemes and services from providerManager
  const providerSchemes = providerManager.getAllAsUnifiedSchemes();
  const providerIds = new Set(providerSchemes.map(s => s.id));

  // 2. Add jurisdiction directories that are not already present
  const directories = getJurisdictionDirectories().filter(d => !providerIds.has(d.id));

  return [...providerSchemes, ...directories];
}

export const ALL_SCHEMES: Scheme[] = buildUnifiedCatalogue();

export function searchSchemes(
  query = '',
  governmentLevel?: string | null,
  stateUt?: string | null,
  category?: string | null,
  schemeServiceType?: string | null
): Scheme[] {
  const q = query.toLowerCase().trim();
  // Ensure we search current unified database
  const catalog = buildUnifiedCatalogue();

  return catalog.filter(s => {
    if (!s.is_active) return false;
    const text = [
      s.name,
      s.description,
      s.category,
      s.state || '',
      s.state_ut || '',
      s.department || '',
      ...(s.benefits || []),
    ].join(' ').toLowerCase();

    if (q) {
      if (!text.includes(q)) {
        // Strip conversational words so queries like "Tell me about PM KISAN" or "schemes for students" find matches
        const stopWords = new Set([
          'tell', 'me', 'about', 'what', 'is', 'the', 'are', 'available', 'for', 'please',
          'can', 'you', 'details', 'of', 'in', 'and', 'to', 'how', 'i', 'get', 'any',
          'my', 'do', 'a', 'an', 'gurinchi', 'cheppandi', 'batao', 'baare', 'portal',
        ]);
        const cleaned = q.replace(/[^a-z0-9\s]/g, ' ');
        const words = cleaned.split(/\s+/).filter(w => w.length >= 3 && !stopWords.has(w));
        if (words.length === 0 || !words.some(w => text.includes(w))) {
          return false;
        }
      }
    }

    if (governmentLevel && governmentLevel !== 'ALL') {
      if (s.government_level !== governmentLevel.toUpperCase()) return false;
    }

    if (stateUt && stateUt !== 'All' && stateUt !== 'All States/UTs') {
      if (s.government_level === 'CENTRAL') {
        // Central schemes/services apply nationally to all citizens
      } else {
        const itemState = (s.state_ut || s.state || '').toLowerCase();
        const targetState = stateUt.toLowerCase();
        if (itemState !== targetState && !itemState.includes(targetState) && !targetState.includes(itemState)) {
          return false;
        }
      }
    }

    if (category && category !== 'All' && s.category.toLowerCase() !== category.toLowerCase()) {
      return false;
    }

    if (schemeServiceType && schemeServiceType !== 'ALL') {
      if (s.scheme_service_type !== schemeServiceType.toUpperCase()) return false;
    }

    return true;
  });
}

export function getSchemeById(schemeId: string): Scheme | undefined {
  const catalog = buildUnifiedCatalogue();
  return catalog.find(s => s.id === schemeId && s.is_active);
}

export function getCatalogueFilters() {
  const catalog = buildUnifiedCatalogue();
  const categories = Array.from(new Set(catalog.map(s => s.category))).sort();
  return {
    government_levels: ['CENTRAL', 'STATE', 'UT'],
    scheme_service_types: ['SCHEME', 'SERVICE'],
    state_uts: JURISDICTIONS.map(([name, level]) => ({ name, government_level: level })),
    categories,
  };
}

export function getSyncSummary() {
  return providerManager.getSyncSummary();
}

export async function syncAllData() {
  return await providerManager.syncAll();
}
