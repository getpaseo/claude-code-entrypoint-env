When installed and enabled, this plugin adds `CLAUDE_CODE_ENTRYPOINT=Paseo` to Claude agents each time a session opens. Other providers are unchanged. There are no additional settings.

This is an optional community workaround for [Claude Code issue #97074](https://github.com/anthropics/claude-code/issues/97074).

Only the launch environment changes. Claude Code sends the label with provider requests; the plugin makes no network requests and stores no data.
