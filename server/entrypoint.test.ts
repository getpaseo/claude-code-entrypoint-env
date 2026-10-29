import assert from "node:assert/strict";
import { test } from "node:test";
import type { PluginServerContext, PluginSessionOpenRequest } from "@getpaseo/plugin/server";
import contribute from "../index.server.ts";

test("labels every Claude opening, preserves other fields and unregisters on cleanup", async () => {
  let handler:
    | ((input: { request: PluginSessionOpenRequest }) => PluginSessionOpenRequest | void)
    | undefined;
  let removed = false;
  const server = {
    before(name: string, callback: typeof handler) {
      assert.equal(name, "agent.session_open");
      handler = callback;
      return () => {
        removed = true;
      };
    },
  } as unknown as PluginServerContext;
  const cleanup = contribute(server);
  assert.ok(handler);
  for (const reason of ["create", "resume", "refresh", "import"] as const) {
    const request: PluginSessionOpenRequest = {
      agentId: "agent",
      workspaceId: null,
      provider: "claude",
      cwd: "/project",
      reason,
      purpose: "interactive",
      env: { UNRELATED: "keep", CLAUDE_CODE_ENTRYPOINT: "sdk-cli" },
    };
    assert.deepEqual(handler({ request }), {
      ...request,
      env: { UNRELATED: "keep", CLAUDE_CODE_ENTRYPOINT: "Paseo" },
    });
    assert.equal(request.env.CLAUDE_CODE_ENTRYPOINT, "sdk-cli");
    assert.equal(handler({ request: { ...request, provider: "codex" } }), undefined);
  }
  cleanup();
  assert.equal(removed, true);
});
