const INVALID_POLICY_BENEFIT_ID = '__invalid-required-benefit-policy__';

/** Malformed persisted prerequisites become a guaranteed missing requirement, never an empty list. */
export function readRequiredBenefitIds(serialized: string): string[] {
  try {
    const parsed: unknown = JSON.parse(serialized);
    if (
      Array.isArray(parsed) &&
      parsed.every((value) => typeof value === 'string' && value.length > 0) &&
      new Set(parsed).size === parsed.length
    ) {
      return parsed;
    }
  } catch {
    // An invalid policy value is represented by a prerequisite with no matching fact.
  }
  return [INVALID_POLICY_BENEFIT_ID];
}
