import { describe, expect, it } from 'vitest';
import { readRequiredBenefitIds } from '../functions/lib/benefit-prerequisites';

describe('persisted policy benefit prerequisites', () => {
  it('reads an explicit, unique list', () => {
    expect(readRequiredBenefitIds('["accessible-results"]')).toEqual(['accessible-results']);
    expect(readRequiredBenefitIds('[]')).toEqual([]);
  });

  it('converts malformed or ambiguous stored configuration into a non-matching requirement', () => {
    for (const value of ['not-json', '{}', '[1]', '["same","same"]', '[""]']) {
      expect(readRequiredBenefitIds(value)).toEqual(['__invalid-required-benefit-policy__']);
    }
  });
});
