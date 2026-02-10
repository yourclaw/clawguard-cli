import { Command } from "commander";
import { runScan } from "./commands/scan";
import { runDoctor } from "./commands/doctor";
import { runCheck } from "./commands/check";
import type { OutputFormat } from "./commands/scan";

const program = new Command();

program
	.name("clawguard")
	.description("Security scanning for AI agent skills")
	.version("0.1.0");

program
	.command("scan")
	.description("Scan a local skill directory for security vulnerabilities")
	.argument("<path>", "Path to the skill directory or SKILL.md file")
	.option(
		"-f, --format <format>",
		"Output format: terminal, json, sarif, markdown, ci",
		"terminal",
	)
	.option("--builtin-only", "Only use built-in scanners (no external tools)", false)
	.option("--skip-ai", "Skip AI-assisted review", false)
	.option("-o, --output <file>", "Write report to a file instead of stdout")
	.action(async (path: string, opts: Record<string, unknown>) => {
		try {
			await runScan(path, {
				format: (opts.format as OutputFormat) ?? "terminal",
				builtinOnly: Boolean(opts.builtinOnly),
				skipAI: Boolean(opts.skipAi),
				output: opts.output as string | undefined,
			});
		} catch (error) {
			console.error(
				`\n  \x1b[31mError:\x1b[0m ${error instanceof Error ? error.message : String(error)}\n`,
			);
			process.exit(1);
		}
	});

program
	.command("check")
	.description("Check a skill against the ClawGuard registry")
	.argument("<name>", "Skill name to look up")
	.option(
		"--registry <url>",
		"Registry URL",
		"https://clawguard.sh",
	)
	.action(async (name: string, opts: Record<string, unknown>) => {
		await runCheck(name, {
			registry: opts.registry as string | undefined,
		});
	});

program
	.command("doctor")
	.description("Check which external scanning tools are available")
	.action(async () => {
		await runDoctor();
	});

program
	.command("report")
	.description("Generate a full security report for a skill")
	.argument("<path>", "Path to the skill directory")
	.option("-o, --output <file>", "Output file (default: report.md)", "report.md")
	.action(async (path: string, opts: Record<string, unknown>) => {
		await runScan(path, {
			format: "markdown",
			builtinOnly: false,
			skipAI: false,
			output: (opts.output as string) ?? "report.md",
		});
	});

program.parse();
