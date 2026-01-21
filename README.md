# XMind to Canvas - Obsidian Plugin

Convert XMind mind map files to JSON Canvas format for seamless integration in Obsidian.

## Features

- 📊 Convert XMind files (.xmind) to JSON Canvas format (.canvas)
- 🎨 Automatic layout calculation using professional graph layout engine
- 🔄 Support for multiple XMind versions (legacy, Zen, 2020+)
- 🎯 Right-click context menu for easy conversion
- ⚡ Command palette integration

## Installation

### Manual Installation

1. Download the latest release from GitHub
2. Extract the files to your vault's plugins folder: `<vault>/.obsidian/plugins/xmind-to-canvas/`
3. Reload Obsidian
4. Enable the plugin in Settings → Community Plugins

## Usage

### Convert XMind File

1. **Via Command Palette:**
   - Press `Ctrl/Cmd + P` to open command palette
   - Search for "Convert XMind to Canvas"
   - Select your XMind file
   - Canvas file will be created in the same location

2. **Via File Menu:**
   - Right-click on any `.xmind` file in your vault
   - Select "Convert to Canvas"

## Technical Details

- **XMind Parser:** Uses official XMind SDK
- **Layout Engine:** ELK.js (Eclipse Layout Kernel)
- **Output Format:** JSON Canvas (https://jsoncanvas.org/)

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Lint code
npm run lint
```

## License

MIT
