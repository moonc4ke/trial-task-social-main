SHELL := /bin/bash

.DEFAULT_GOAL := help

.PHONY: help sync dev

help: ## Show all targets
	@grep -E '^[a-zA-Z0-9_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN{FS=":.*?## "}{printf "\033[36m%-10s\033[0m %s\n", $$1, $$2}'

sync: ## Install deps (default + dev)
	uv sync --all-groups

dev: ## Run FastAPI server
	uv run python -m src.main
