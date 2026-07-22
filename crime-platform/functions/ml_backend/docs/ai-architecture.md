# Kangavalu AI Architecture

## Overview
The AI Module (`backend/src/ai/`) provides a robust, extensible infrastructure for integrating large language models with the Kangavalu Crime Intelligence Platform. It leverages a Retriever-Augmented Generation (RAG) approach combined with a Tool Registry and Intent Classification to enable dynamic, agent-based reasoning.

## Core Components
1. **Providers**: Abstractions for interacting with models like Google Gemini, OpenAI, or Zoho Catalyst QuickML.
2. **Retrievers**: Interfaces for pulling data from various sources (Search, Analytics, Graph).
3. **Orchestrator**: The central controller mapping Intents to Context Builders and prompting the Provider.
4. **Tool Registry**: Pluggable actions the orchestrator can take.
5. **Memory**: Conversation storage through standard Repository patterns.
6. **Streaming**: Real-time LLM responses supported natively via Server-Sent Events (SSE).

## Extension Points
- Implement new Providers in `src/ai/providers/`.
- Add new Tools to the `ToolRegistry` (`src/ai/tools/`).
- Create specialized Prompt Builders in `src/ai/prompts/`.
