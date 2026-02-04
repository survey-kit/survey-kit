.PHONY: lint lint-fix format build dev dev-all clean help docs-format docs-format-check docs-build docs-serve

help:
	@echo "Survey-Kit Makefile commands"
	@echo "  make install-all       - Install dependencies for all packages"
	@echo "  make install-dev-all   - Install dev dependencies only for all packages"
	@echo "  make lint              - Run ESLint on all packages"
	@echo "  make lint-fix          - Fix ESLint issues on all packages"
	@echo "  make format            - Format code with Prettier"
	@echo "  make build             - Build all packages"
	@echo "  make dev               - Run dev server for template package"
	@echo "  make dev-all           - Run dev servers for all packages"
	@echo "  make clean             - Remove node_modules and build artifacts"
	@echo "  make docs-format       - Format docs markdown files"
	@echo "  make docs-format-check - Check docs formatting"
	@echo "  make docs-build        - Build documentation"
	@echo "  make docs-serve        - Serve documentation locally"

install-all:
	npm install --workspaces

install-dev-all:
	npm install --workspaces --only=dev

lint:
	npm run lint --workspaces

lint-fix:
	npm run lint:fix --workspaces

format:
	npm run format --workspaces

build:
	npm run build --workspaces

dev:
	npm run dev --workspace=packages/template

dev-all:
	npm run dev --workspaces

clean:
	rm -rf node_modules packages/*/node_modules packages/*/dist

docs-format:
	npx prettier --write "docs/**/*.md"

docs-format-check:
	npx prettier --check "docs/**/*.md"

docs-build:
	cd docs && mkdocs build --strict

docs-serve:
	cd docs && mkdocs serve

