# @clawguard/cli — Makefile
SHELL := /bin/bash
RULES := $(shell cd .. && pwd)/clawguard-rules

.PHONY: install build test lint scan clean help

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[0;32m%-15s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	npm install

build: ## Build with tsup
	npm run build

test: ## Run a demo scan against test fixtures
	@echo "Scanning malicious fixture..."
	@node bin/clawguard.js scan $(RULES)/test-fixtures/malicious/data-exfiltration-skill --builtin-only --skip-ai
	@echo ""
	@echo "Scanning benign fixture..."
	@node bin/clawguard.js scan $(RULES)/test-fixtures/benign/memory-manager-skill --builtin-only --skip-ai

lint: ## Run Biome linter
	npm run lint

scan: test ## Alias for test

doctor: ## Check which scanning tools are installed
	@node bin/clawguard.js doctor

clean: ## Remove dist/ and node_modules/
	rm -rf dist node_modules
