import assert from "node:assert/strict";
import { test } from "node:test";
import type {
  PluginHookContext,
  PluginServerContext,
  PluginSessionOpenRequest,
} from "@getpaseo/plugin/server";
import contribute from "../index.server.ts";

type Handler = (
  input: { request: PluginSessionOpenRequest },
  context: PluginHookContext,
) => Promise<PluginSessionOpenRequest | void>;

function register() {
  let handler: Handler | undefined;
  let removed = false;
  const server = {
    before(name: string, callback: Handler) {
      assert.equal(name, "agent.session_open");
      handler = callback;
      return () => {
        removed = true;
      };
    },
  } as unknown as PluginServerContext;
  const cleanup = contribute(server);
  assert.ok(handler);
  return { handler, cleanup: () => (cleanup(), removed) };
}

function contextWith(providers: Record<string, { extends?: string }> | Error) {
  let calls = 0;
  const context = {
    signal: new AbortController().signal,
    paseo: {
      config: {
        async get() {
          calls += 1;
          if (providers instanceof Error) throw providers;
          return { requestId: "r", config: { providers } };
        },
      },
    },
  } as unknown as PluginHookContext;
  return { context, calls: () => calls };
}

function opening(provider: string, reason: PluginSessionOpenRequest["reason"] = "create") {
  return {
    agentId: "agent",
    workspaceId: null,
    provider,
    cwd: "/project",
    reason,
    purpose: "interactive",
    env: { UNRELATED: "keep", CLAUDE_CODE_ENTRYPOINT: "sdk-cli" },
  } satisfies PluginSessionOpenRequest;
}

const labelled = { UNRELATED: "keep", CLAUDE_CODE_ENTRYPOINT: "Paseo" };

test("labels every built-in Claude opening without reading config, and unregisters on cleanup", async () => {
  const { handler, cleanup } = register();
  const { context, calls } = contextWith({});
  for (const reason of ["create", "resume", "refresh", "import"] as const) {
    const request = opening("claude", reason);
    assert.deepEqual(await handler({ request }, context), { ...request, env: labelled });
    assert.equal(request.env.CLAUDE_CODE_ENTRYPOINT, "sdk-cli");
  }
  assert.equal(calls(), 0);
  assert.equal(cleanup(), true);
});

test("labels custom providers that extend Claude, directly or through a chain", async () => {
  const { handler } = register();
  const { context } = contextWith({
    "claude-work": { extends: "claude" },
    "claude-team": { extends: "claude-work" },
  });
  for (const provider of ["claude-work", "claude-team"]) {
    const request = opening(provider);
    assert.deepEqual(await handler({ request }, context), { ...request, env: labelled });
  }
});

test("leaves other provider types unchanged, whatever their ID", async () => {
  const { handler } = register();
  const { context } = contextWith({
    "claude-like-codex": { extends: "codex" },
    "loop-a": { extends: "loop-b" },
    "loop-b": { extends: "loop-a" },
  });
  for (const provider of ["codex", "claude-like-codex", "unknown", "loop-a"]) {
    assert.equal(await handler({ request: opening(provider) }, context), undefined);
  }
});

test("never blocks a session open when the config cannot be read", async () => {
  const { handler } = register();
  const { context } = contextWith(new Error("daemon unavailable"));
  assert.equal(await handler({ request: opening("claude-work") }, context), undefined);
});
