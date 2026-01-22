# XMind to Canvas

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/@wllzhang/xmind-to-canvas.svg)](https://www.npmjs.com/package/@wllzhang/xmind-to-canvas)
[![Build Status](https://github.com/wllzhang/xmind-to-canvas/actions/workflows/release.yml/badge.svg)](https://github.com/wllzhang/xmind-to-canvas/actions/workflows/release.yml)

Convert XMind mind map files to JSON Canvas format for seamless integration in Obsidian.

> **JSON Canvas Format**: This tool converts XMind files to the [JSON Canvas](https://github.com/obsidianmd/jsoncanvas) format, an open file format for infinite canvas data originally created for Obsidian. JSON Canvas files use the `.canvas` extension and can be used in any app that supports the format.

## Features

- 📊 Convert XMind files (.xmind) to JSON Canvas format (.canvas)
- 🎨 Automatic layout calculation using professional graph layout engine
- 🔄 Support for multiple XMind versions (legacy, Zen, 2020+)
- 🎯 Right-click context menu for easy conversion (plugin only)
- ⚡ Command palette integration (plugin only)
- 🌐 Web version available - no installation required

## Usage

### Option 1: Obsidian Plugin (Recommended for Obsidian Users)

Install from the Obsidian Community Plugins marketplace or manually:

1. Download the latest release from [GitHub Releases](https://github.com/wllzhang/xmind-to-canvas/releases)
2. Extract files to `<vault>/.obsidian/plugins/xmind-to-canvas/`
3. Reload Obsidian and enable the plugin in Settings → Community Plugins

**Usage:**
- **Command Palette:** Press `Ctrl/Cmd + P` → Search "Convert XMind to Canvas" → Select file
- **File Menu:** Right-click any `.xmind` file → Select "Convert to Canvas"

### Option 2: Web Version (No Installation Required)

Use the standalone web version directly in your browser:

🌐 **[Open GitHub Pages](https://wllzhang.github.io/xmind-to-canvas/)**

Simply upload your `.xmind` file and download the converted `.canvas` file. All processing happens in your browser - no data is uploaded to any server.

### Option 3: NPM Package (For Developers)

Install as a dependency in your Node.js project:

```bash
npm install @wllzhang/xmind-to-canvas
```

**Quick Start:**

```javascript
import { convertXMindToCanvas } from '@wllzhang/xmind-to-canvas';
import fs from 'fs/promises';

// Convert XMind file to Canvas format
const xmindBuffer = await fs.readFile('example.xmind');
const { canvasData } = await convertXMindToCanvas(xmindBuffer);

// Save as JSON Canvas file
await fs.writeFile('example.canvas', JSON.stringify(canvasData, null, 2));
```

For detailed API documentation, see [API.md](./API.md).

## Development

```bash
npm install          # Install dependencies
npm run dev          # Development mode with watch
npm run build        # Production build (Obsidian plugin)
npm run build:web    # Build web bundle (for GitHub Pages)
npm test             # Run tests
npm run lint         # Lint code
```

### Version Management

Versions are centrally managed:
- Plugin version: `package.json`
- Min app version: `versions.json` (maps plugin versions to Obsidian versions)
- Manifest: Auto-synced during build

## Contributing

See [CONTRIBUTING.md](.github/CONTRIBUTING.md) for guidelines.

## License

MIT - See [LICENSE](LICENSE) for details.
