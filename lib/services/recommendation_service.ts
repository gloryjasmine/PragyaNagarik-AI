import { Profile, RecommendationResult } from '../types';
import { ALL_SCHEMES } from './scheme_service';
import { evaluateEligibility } from './eligibility_service';

export function recommendSchemes(profile: Profile): RecommendationResult[] {
  const results: RecommendationResult[] = [];
  for (const scheme of ALL_SCHEMES) {
    if (!scheme.is_active) continue;
    const result = evaluateEligibility(scheme, profile);
    let relevance = result.score;
    const occupations = scheme.eligibility?.occupations;
    if (profile.occupation && Array.isArray(occupations) && occupations.includes(profile.occupation)) {
      relevance = Math.max(relevance, 80);
    }

    const why =
      result.matched_conditions.length > 0
        ? result.matched_conditions.map(m => `Your ${m} matches the available scheme rule.`)
        : ['This scheme may be relevant to your situation; check the official criteria.'];

    results.push({
      scheme,
      match_score: relevance,
      why,
      eligibility: result,
    });
  }

  return results.sort((a, b) => b.match_score - a.match_score);
}
