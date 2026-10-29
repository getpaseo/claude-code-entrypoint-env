# Claude Code entrypoint environment

An optional Paseo server plugin that sets `CLAUDE_CODE_ENTRYPOINT=Paseo` whenever a Claude agent session opens. This includes fresh sessions and later opens of existing agents. Other providers are unchanged.

This is the community workaround discussed in [Anthropic's Claude Code issue #97074](https://github.com/anthropics/claude-code/issues/97074). Anthropic has not endorsed it or confirmed the cause of the reported subscription metering difference. Quota savings, weekly allowance improvements and API billing reductions are not guaranteed. The entrypoint also affects Claude Code features, so this label is more than telemetry.

## Install

Requires Paseo `>=0.14.0-beta.2 <0.15.0`, on the daemon host. It has no client UI or platform-specific dependencies.

```sh
paseo plugin add github:getpaseo/claude-code-entrypoint-env --ref v1.0.0
```

Enable plugins in Paseo Settings if needed. Plugins are trusted, unsandboxed code. Installing this plugin opts Claude sessions into relabeling; there are no additional settings.

The plugin contributes the label at session opening, overwriting an existing entrypoint override while preserving unrelated launch environment. Enabling or disabling a session-open plugin makes open sessions stale; changes apply before the next idle prompt without interrupting a running turn.

Paseo beta.2 itself hardcodes this label. On that version disabling this plugin cannot remove the core label. The optional behavior requires a Paseo build containing the core removal; this plugin also works with that build.

## Data and permissions

The plugin makes no network requests, reads no files, stores no data and downloads no software. Claude Code inherits the label and includes its client identity in provider requests and session metadata. Normal Claude prompts and tool results still go through the configured Claude provider; this plugin does not intercept them. Child commands can inherit the label.

Disable or remove it to stop contributing the label on subsequent opens:

```sh
paseo plugin disable claude-code-entrypoint-env
paseo plugin remove claude-code-entrypoint-env
```

## Development

Use Node.js 22.18 or newer. Development dependencies are locked; installation into Paseo needs no dependencies or build step.

```sh
npm ci --ignore-scripts
npm test
npm run typecheck
npm run lint
npm run format:check
```

The plugin uses the public `before("agent.session_open")` API to include beta.2 compatibility. This API is retained by Paseo 0.14; the newer hook name is `agent.open.before`.

MIT licensed.
