import { writeFile } from 'node:fs/promises';
import { communityAIAgreementJsonSchema } from '../packages/community-ai-agreement/src/index.ts';

const path = new URL('../packages/community-ai-agreement/schema.json', import.meta.url);
await writeFile(path, `${JSON.stringify(communityAIAgreementJsonSchema(), null, 2)}\n`);
