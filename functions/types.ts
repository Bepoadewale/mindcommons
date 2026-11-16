interface Env {
  DB: D1Database;
  AI?: Ai;
  DEMO_AI_MODE?: string;
  LOCAL_DEVELOPMENT?: string;
}

type Context = EventContext<Env, string, Record<string, unknown>>;

export type { Context, Env };
