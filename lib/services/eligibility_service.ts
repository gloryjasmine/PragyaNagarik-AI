import { Profile, Scheme, EligibilityResult } from '../types';

export function evaluateEligibility(scheme: Scheme, profile: Profile): EligibilityResult {
  const rules = scheme.eligibility || {};
  const matched: string[] = [];
  const failed: string[] = [];
  const missing: string[] = [];

  const checks: [string, any][] = [
    ['state', profile.state],
    ['occupation', profile.occupation],
    ['age', profile.age],
    ['annual_income', profile.annual_income],
    ['category', profile.category],
  ];

  for (const [key, value] of checks) {
    if (!(key in rules)) continue;
    if (value === undefined || value === null || value === '') {
      missing.push(key.replace('_', ' '));
      continue;
    }
    const rule = rules[key];
    let ok = false;
    if (Array.isArray(rule)) {
      ok = rule.includes(value);
    } else if (key === 'annual_income') {
      ok = Number(value) <= Number(rule);
    } else {
      ok = String(value).toLowerCase() === String(rule).toLowerCase();
    }

    if (ok) {
      matched.push(key.replace('_', ' '));
    } else {
      failed.push(key.replace('_', ' '));
    }
  }

  const total = matched.length + failed.length + missing.length;
  const score = Math.max(0, Math.round((100 * matched.length) / Math.max(1, total)));

  return {
    status: failed.length === 0 ? 'Eligible' : 'Needs review',
    score,
    matched_conditions: matched,
    failed_conditions: failed,
    missing_information: missing,
    required_documents: scheme.documents || [],
    explanation:
      'This is an assistive match, not an approval. Verify every condition with the official source.',
  };
}
