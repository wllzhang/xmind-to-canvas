# XMind to Canvas

Convert XMind mind map files to JSON Canvas format for seamless integration in Obsidian.

## Features

- 📊 Convert XMind files (.xmind) to JSON Canvas format (.canvas)
- 🎨 Automatic layout calculation using professional graph layout engine
- 🔄 Support for multiple XMind versions (legacy, Zen, 2020+)
- 🎯 Right-click context menu for easy conversion (plugin only)
- ⚡ Command palette integration (plugin only)
- 🌐 Web version available - no installation required

## Two Ways to Use

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

## Development

```bash
npm install          # Install dependencies
npm run dev          # Development mode with watch
npm run build        # Production build
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
