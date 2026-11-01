import type { PluginHookContext, PluginServerContext } from "@getpaseo/plugin/server";

const CLAUDE_PROVIDER = "claude";

type ProviderEntries = Record<string, { extends?: unknown } | undefined>;

// Custom providers may extend Claude under any ID (e.g. "claude-work"), so
// follow the configured `extends` chain to the built-in provider type.
async function isClaudeProvider(provider: string, paseo: PluginHookContext["paseo"]) {
  if (provider === CLAUDE_PROVIDER) return true;
  let providers: ProviderEntries;
  try {
    providers = ((await paseo.config.get()).config.providers ?? {}) as ProviderEntries;
  } catch {
    // Never block a session open because the label could not be resolved.
    return false;
  }
  const seen = new Set<string>();
  let id = provider;
  while (!seen.has(id)) {
    seen.add(id);
    const base = providers[id]?.extends;
    if (typeof base !== "string") return false;
    if (base === CLAUDE_PROVIDER) return true;
    id = base;
  }
  return false;
}

export default function contribute(server: PluginServerContext) {
  return server.before("agent.session_open", async ({ request }, { paseo }) => {
    if (!(await isClaudeProvider(request.provider, paseo))) return;
    return {
      ...request,
      env: { ...request.env, CLAUDE_CODE_ENTRYPOINT: "Paseo" },
    };
  });
}
