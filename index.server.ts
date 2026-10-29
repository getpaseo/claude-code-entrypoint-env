import type { PluginServerContext } from "@getpaseo/plugin/server";

export default function contribute(server: PluginServerContext) {
  return server.before("agent.session_open", ({ request }) => {
    if (request.provider !== "claude") return;
    return {
      ...request,
      env: { ...request.env, CLAUDE_CODE_ENTRYPOINT: "Paseo" },
    };
  });
}
