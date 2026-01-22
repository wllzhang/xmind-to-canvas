# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.6] - 2026-01-22

### Fixed
- Enhanced title extraction logic in XMindParser to handle object types more robustly
- Added fallback for non-string properties in title extraction

### Changed
- Updated web interface (index.html and app.js) for language localization
- Changed interface text from Chinese to English for improved accessibility

## [1.0.5] - 2026-01-22

### Changed
- Updated minimum Obsidian version requirement to 0.15.0

## [1.0.0] - 2026-01-22

### Added
- Initial stable release
- Full support for converting XMind files (.xmind) to JSON Canvas format (.canvas)
- Automatic layout calculation using ELK.js (Eclipse Layout Kernel)
- Support for multiple XMind versions:
  - Legacy XMind format
  - XMind Zen format
  - XMind 2020+ format
- Obsidian plugin integration:
  - Right-click context menu for easy file conversion
  - Command palette integration ("Convert XMind to Canvas")
  - Automatic file placement in vault
- Web version for browser-based conversion:
  - Standalone web application
  - No installation required
  - Client-side processing (privacy-first)
  - GitHub Pages deployment
- Image support in XMind files:
  - Automatic image extraction and embedding
  - Support for embedded images in canvas nodes
- Comprehensive test suite:
  - Unit tests with Vitest
  - End-to-end conversion tests
  - Test fixtures for various XMind formats
- Version synchronization system:
  - Centralized version management via `versions.json`
  - Automatic manifest synchronization during build

### Technical Details
- **Parser**: XMind file parser using JSZip for ZIP archive extraction
- **Layout Engine**: ELK.js (Eclipse Layout Kernel) for professional graph layout
- **Output Format**: JSON Canvas specification (https://jsoncanvas.org/)
- **Language**: TypeScript with full type safety
- **Build System**: Rollup with TypeScript support
- **Testing**: Vitest with coverage support
- **Linting**: ESLint with TypeScript and Obsidian-specific rules

## [0.1.0] - 2026-01-21

### Added
- Initial release of XMind to Canvas converter
- Basic XMind file parsing and conversion
- Core conversion engine
- TypeScript implementation

[Unreleased]: https://github.com/wllzhang/xmind-to-canvas/compare/v1.0.6...HEAD
[1.0.6]: https://github.com/wllzhang/xmind-to-canvas/compare/v1.0.5...v1.0.6
[1.0.5]: https://github.com/wllzhang/xmind-to-canvas/compare/v1.0.0...v1.0.5
[1.0.0]: https://github.com/wllzhang/xmind-to-canvas/compare/v0.1.0...v1.0.0
[0.1.0]: https://github.com/wllzhang/xmind-to-canvas/releases/tag/v0.1.0
