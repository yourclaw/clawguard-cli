# Contributing to ClawGuard CLI

The CLI provides the `clawguard` command for scanning skills from the terminal.

For full contributing guidelines (setup, coding standards, PR process), see the
main [CONTRIBUTING.md](https://github.com/yourclaw/clawguard/blob/main/CONTRIBUTING.md).

---

## Working on the CLI

- Commands live in `src/commands/` (scan, check, doctor).
- Formatters live in `src/formatters/` (terminal, JSON, SARIF, markdown, CI).
- The entry point is `bin/clawguard.js` → `src/cli.ts`.
- Uses [Commander.js](https://github.com/tj/commander.js/) for argument parsing
  and [Chalk](https://github.com/chalk/chalk) for coloured output.

### Quick test cycle

```bash
npm run build
node bin/clawguard.js scan ../clawguard-rules/test-fixtures/malicious/data-exfiltration-skill --builtin-only --skip-ai
```
