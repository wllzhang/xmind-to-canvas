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

### Version Management

Version numbers are centrally managed to avoid inconsistencies:

- **Plugin Version**: Defined in `package.json` (single source of truth)
- **Min App Version**: Mapped in `versions.json` (maps plugin versions to required Obsidian versions)
- **Manifest**: Automatically synced from the above sources during build

To update versions:
1. Update `package.json` version field
2. Add/update the version mapping in `versions.json` if minAppVersion changes
3. Run `npm run sync-versions` (or it will run automatically during build)

Example `versions.json`:
```json
{
  "0.1.0": "0.15.0",
  "0.2.0": "0.16.0"
}
```

## Testing

This project uses [Vitest](https://vitest.dev/) for testing.

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Structure

- `tests/xmind-parser.test.ts` - XMind file parsing tests
- `tests/layout-calculator.test.ts` - Layout calculation tests
- `tests/canvas-generator.test.ts` - Canvas generation tests
- `tests/e2e-conversion.test.ts` - End-to-end conversion tests (including image handling)

### Test Fixtures

The `tests/fixtures/xmind-builder.ts` provides utilities to programmatically create XMind files for testing:

```typescript
import { XMindBuilder, createTestPngImage } from './fixtures/xmind-builder';

const builder = new XMindBuilder();
builder.addImage('test.png', createTestPngImage());
builder.addSheet({
  id: 'sheet-1',
  title: 'Test',
  rootTopic: {
    id: 'root',
    title: 'Root Topic',
    image: { src: 'test.png', width: 200, height: 150 },
    children: [{ id: 'child-1', title: 'Child' }],
  },
});
const xmindBuffer = await builder.build();
```

## Web Version

A standalone web version is available in the `web/` directory. It uses the same core library and can be deployed to GitHub Pages or any static hosting.

```bash
# Build the web bundle
npm run build:web

# Serve locally
npm run serve:web
```

## License

MIT
