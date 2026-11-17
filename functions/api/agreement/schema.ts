import { communityAIAgreementJsonSchema } from '../../../packages/community-ai-agreement/src';
import { json } from '../../lib/http';
import type { Context } from '../../types';

export function onRequestGet(_context: Context): Response {
  return json(communityAIAgreementJsonSchema());
}
