interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  AI?: Ai;
  DEMO_AI_MODE?: string;
  LOCAL_DEVELOPMENT?: string;
}

type Context = { request: Request; env: Env };

export type { Context, Env };
