Sets `CLAUDE_CODE_ENTRYPOINT=Paseo` whenever a Claude Code agent session opens, including later opens of existing agents. Other providers are unchanged. Installing and enabling this plugin opts all Claude agents on that host into the label; there are no settings or client interface.

This is an optional community workaround for the subscription metering differences reported in [Claude Code issue #97074](https://github.com/anthropics/claude-code/issues/97074). Anthropic has not endorsed it or confirmed the cause. No particular quota savings, weekly allowance improvement or API billing reduction is promised. The entrypoint also affects Claude Code features and can be inherited by child commands.

Requires Paseo `>=0.14.0-beta.2 <0.15.0`. Paseo beta.2 already hardcodes this label, so disabling the plugin on beta.2 does not remove it. Optional relabeling requires a Paseo build containing the core removal. Changes apply on subsequent session opens; a running turn is not interrupted.

The plugin makes no network requests, reads no files, stores no data and installs no software. Claude Code sends its client identity with provider requests and records session metadata. Prompts and tool results continue through the configured Claude provider. The plugin does not intercept them.
