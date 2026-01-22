# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2024-01-XX

### Added
- Initial release of XMind to Canvas converter
- Support for converting XMind files (.xmind) to JSON Canvas format (.canvas)
- Automatic layout calculation using ELK.js (Eclipse Layout Kernel)
- Support for multiple XMind versions (legacy, Zen, 2020+)
- Right-click context menu for easy file conversion
- Command palette integration for conversion
- Image support in XMind files
- Web version for browser-based conversion
- Comprehensive test suite with Vitest
- Version synchronization system for centralized version management

### Technical Details
- XMind parser using JSZip for file extraction
- Professional graph layout engine (ELK.js)
- Output format: JSON Canvas (https://jsoncanvas.org/)
- TypeScript implementation with full type safety

