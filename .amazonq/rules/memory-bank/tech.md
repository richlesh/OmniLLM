# NeuroPanther Chat — Technology Stack

## Runtime & Framework
- **Electron** ^41.3.0 — cross-platform desktop shell (Chromium + Node.js)
- **Node.js** v18+ required
- **Module system** — CommonJS (`"type": "commonjs"` in package.json)

## AI SDKs (Runtime Dependencies)
| Package | Version | Used For |
|---|---|---|
| `openai` | ^6.34.0 | OpenAI, DeepSeek, Alibaba, Meta, Google text (OpenAI-compat) |
| `@anthropic-ai/sdk` | ^0.91.1 | Anthropic Claude models |
| `@google/genai` | ^1.50.1 | Google Imagen image generation |

## UI Libraries (Runtime Dependencies)
| Package | Version | Used For |
|---|---|---|
| `marked` | ^18.0.2 | Markdown → HTML rendering in chat |
| `highlight.js` | ^11.11.1 | Syntax highlighting in code blocks |

## Dev Dependencies
| Package | Version | Used For |
|---|---|---|
| `electron` | ^41.3.0 | App runtime |
| `electron-builder` | ^26.8.1 | Cross-platform distribution packaging |
| `png-to-ico` | ^3.0.1 | Icon conversion utility |

## Build & Distribution
- **electron-builder** handles packaging for all platforms
- App ID: `com.richardlesh.neuropanther-chat`
- Artifact naming: `NeuroPanther-Chat-{version}-{arch}.{ext}`

### Build Targets
| Platform | Format |
|---|---|
| macOS | DMG |
| Windows | NSIS installer |
| Linux | DEB + RPM (x64 and arm64) |

### Build Commands
```bash
npm start                  # Development run
npm run dist:mac:x64       # macOS Intel
npm run dist:mac:arm64     # macOS Apple Silicon
npm run dist:win:x64       # Windows x64
npm run dist:win:arm64     # Windows ARM64
npm run dist:linux:x64     # Linux x64
npm run dist:linux:arm64   # Linux ARM64
npm run dist:all           # All platforms sequentially
```

## Utility Script
- `generate_neuropanther_chat_license_key.py` — standalone Python script for license key generation (no Python version pinned; standard library only assumed)

## Persisted Data
- Settings file: `~/.neuropanther-chat-settings.json` (written by main process via `fs` module)
- Structure: `{ vendor, model, apiKeys: { [vendorId]: string } }`

## Vendor API Endpoints
| Vendor | Endpoint |
|---|---|
| OpenAI | Default OpenAI SDK endpoint |
| Anthropic | Default Anthropic SDK endpoint |
| Google (text) | `https://generativelanguage.googleapis.com/v1beta/openai` |
| DeepSeek | `https://api.deepseek.com` |
| Alibaba | `https://dashscope-us.aliyuncs.com/compatible-mode/v1` |
| Meta | `https://api.llama.com/compat/v1` |
