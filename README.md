# @yourclaw/clawguard-cli

Command-line interface for the ClawGuard security scanner. Scan AI agent skills
for prompt injection, secrets, malware, and permission abuse from your terminal.

---

## Installation

```bash
# Global install
npm install -g @yourclaw/clawguard-cli

# Or run directly with npx
npx @yourclaw/clawguard-cli scan /path/to/skill
```

For local development as part of the ClawGuard project:

```bash
cd ../clawguard && make setup
```

---

## Commands

### `clawguard scan <path>`

Scan a skill directory for security issues.

```bash
# Basic scan (builtin patterns only, no external tools)
clawguard scan ./my-skill --builtin-only --skip-ai

# Full scan with all available tools
clawguard scan ./my-skill

# Output as SARIF for GitHub Code Scanning
clawguard scan ./my-skill --format sarif > results.sarif

# CI-friendly output with exit codes
clawguard scan ./my-skill --format ci
```

**Options:**

| Flag | Description |
| ---- | ----------- |
| `--builtin-only` | Skip external tools (gitleaks, semgrep, etc.) |
| `--skip-ai` | Skip AI review for ambiguous findings |
| `--format <fmt>` | Output format: `terminal` (default), `json`, `sarif`, `markdown`, `ci` |

**Exit codes** (CI format):

| Code | Meaning |
| ---- | ------- |
| 0 | Passed — no issues found |
| 1 | Warning — medium-severity findings |
| 2 | Blocked — critical/high-severity findings |

### `clawguard check <name>`

Look up a skill in the ClawGuard trust registry.

```bash
clawguard check memory-manager
clawguard check code-formatter --registry https://clawguard.sh
```

**Options:**

| Flag | Description |
| ---- | ----------- |
| `--registry <url>` | Registry URL (default: `https://clawguard.sh`) |

### `clawguard doctor`

Check which external scanning tools are available on your system.

```bash
clawguard doctor
```

Example output:

```
ClawGuard Doctor
════════════════

  gitleaks    ✓ installed
  semgrep     ✓ installed
  mcp-scan    ✗ not found
  npm         ✓ installed
```

---

## Examples

### Scan a local skill

```bash
$ clawguard scan ./my-memory-skill --builtin-only --skip-ai

  ClawGuard Scan Report
  ═════════════════════

  Skill:     my-memory-skill
  Status:    ✓ PASSED
  Score:     0 / 100
  Findings:  0

  Recommendation: Safe to install
```

### Scan a skill with findings

```bash
$ clawguard scan ./suspicious-skill --builtin-only --skip-ai

  ClawGuard Scan Report
  ═════════════════════

  Skill:     suspicious-skill
  Status:    ✗ BLOCKED
  Score:     85 / 100
  Findings:  7

  CRITICAL  PI-001  Prompt injection: instruction override attempt
  CRITICAL  MAL-002 Reverse shell detected
  HIGH      MAL-003 Data exfiltration pattern
  HIGH      SEC-001 AWS access key detected
  ...

  Recommendation: Do not install
```

### Use in CI/CD

```yaml
# .github/workflows/scan.yml
- name: Scan skill
  run: npx @yourclaw/clawguard-cli scan ./skill --builtin-only --skip-ai --format ci
```

---

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run locally (without building)
node bin/clawguard.js scan ../clawguard-rules/test-fixtures/malicious/data-exfiltration-skill --builtin-only --skip-ai

# Lint
npm run lint
```

---

## Makefile

```bash
make install    # npm install
make build      # tsup build
make test       # run the demo scan
make lint       # biome check
make clean      # remove dist/ and node_modules/
```

---

## Contributing

See the main [CONTRIBUTING.md](https://github.com/yourclaw/clawguard/blob/main/CONTRIBUTING.md)
for guidelines. To work on the CLI specifically:

```bash
git clone https://github.com/yourclaw/clawguard.git && cd clawguard
make bootstrap    # sets up all repos
cd ../clawguard-cli
# make changes...
npm run build && node bin/clawguard.js scan ../clawguard-rules/test-fixtures/malicious/data-exfiltration-skill --builtin-only --skip-ai
```

---

## License

[Apache-2.0](https://www.apache.org/licenses/LICENSE-2.0)
