# OmniLLM — Product Overview

## Purpose
OmniLLM is a cross-platform desktop chatbot application built with Electron that provides a unified interface for interacting with multiple AI vendors and models. It eliminates the need to switch between different web interfaces by consolidating access to major LLM providers in one native desktop app.

## Version
1.2.0 (package.json) / 1.1.0 (README)

## Key Features

### Multi-Vendor AI Support
- **OpenAI** — GPT-4o, GPT-4o Mini, GPT-4 Turbo, GPT-3.5 Turbo
- **Anthropic** — Claude Opus 4.5, Claude Sonnet 4.5, Claude Haiku 4.5
- **Google** — Gemini 2.0 Flash, Gemini 2.0 Flash Lite, Gemini 1.5 Pro, Gemini 1.5 Flash
- **DeepSeek** — DeepSeek Chat, DeepSeek Reasoner
- **Alibaba** — Qwen Max, Qwen Plus, Qwen Turbo
- **Meta** — Llama 3.3 70B, Llama 3.1 8B

### Chat Interface
- Tabbed multi-chat windows (Cmd/Ctrl+T to open, Cmd/Ctrl+W to close)
- Draggable/renameable tabs with unsaved-change indicators
- Markdown rendering with syntax-highlighted code blocks
- Persistent conversation history per tab
- Enter to send, Shift+Enter for newlines

### Image Capabilities
- Image upload for vision analysis (OpenAI, Anthropic)
- Image generation via DALL-E 3 (OpenAI) and Imagen 4.0 (Google)
- Right-click context menu: copy or save generated images
- Download button on generated images

### Per-Message Actions
- Copy response to clipboard
- Text-to-speech playback (toggle speak/stop)

### Settings & Configuration
- Per-vendor API key storage
- Settings persisted to `~/.omnillm-settings.json`
- Vendor/model selection via dropdowns
- Direct links to each vendor's API key page

## Target Users
Desktop users who work with multiple AI providers and want a single native app with persistent chat history, image support, and a clean tabbed interface — without browser-based tools.

## Use Cases
- Comparing responses across different LLM vendors/models
- Long-form conversations with context retention
- Image analysis and generation workflows
- Developer productivity with code-block syntax highlighting
