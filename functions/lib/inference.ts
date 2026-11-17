import type { AIInferenceBinding } from '../../packages/governance/src/authorization';
import type { Env } from '../types';

export function inferenceFor(env: Env): { binding: AIInferenceBinding; mode: 'live' | 'mock' } {
  if (
    (env.DEMO_AI_MODE === 'mock' || env.DEMO_AI_MODE === 'mock-delay') &&
    env.LOCAL_DEVELOPMENT === 'true'
  ) {
    const delayed = env.DEMO_AI_MODE === 'mock-delay';
    return {
      mode: 'mock',
      binding: {
        async run() {
          if (delayed) {
            console.info('LOCAL_MOCK_INFERENCE_STARTED');
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
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
