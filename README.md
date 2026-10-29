# Claude Code entrypoint environment

When installed and enabled, this plugin adds `CLAUDE_CODE_ENTRYPOINT=Paseo` to Claude agents each time a session opens. Other providers are unchanged.

This is an optional community workaround for [Claude Code issue #97074](https://github.com/anthropics/claude-code/issues/97074).

```sh
paseo plugin add getpaseo/claude-code-entrypoint-env
```

Enable plugins in Paseo Settings if needed. There are no additional settings.

Only the launch environment changes. Claude Code sends the label with provider requests; the plugin makes no network requests and stores no data.
