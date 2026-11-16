import type { AIInferenceBinding } from '../../packages/governance/src/authorization';
import type { Env } from '../types';

export function inferenceFor(env: Env): { binding: AIInferenceBinding; mode: 'live' | 'mock' } {
  if (env.DEMO_AI_MODE === 'mock' && env.LOCAL_DEVELOPMENT === 'true') {
    return {
      mode: 'mock',
      binding: {
        async run() {
          return {
            themes: [
              {
                theme: 'access to trusted wellbeing information',
                examples: ['Fictional participant A', 'Fictional participant C'],
              },
              {
                theme: 'barriers to community participation',
                examples: ['Fictional participant B'],
              },
            ],
            note: 'Deterministic local test double; no model inference occurred.',
          };
        },
      },
    };
  }
  if (!env.AI) throw new Error('Workers AI binding is not configured.');
  return { mode: 'live', binding: env.AI };
}
