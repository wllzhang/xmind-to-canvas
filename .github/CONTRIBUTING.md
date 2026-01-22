# Contributing to XMind to Canvas

Thank you for your interest in contributing to XMind to Canvas! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/xmind-to-canvas.git`
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b feature/your-feature-name`

## Development Setup

```bash
# Install dependencies
npm install

# Run in development mode (with watch)
npm run dev

# Run tests
npm test

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix
```

## Making Changes

### Code Style

- Follow the existing code style
- Use TypeScript for all new code
- Run `npm run lint` before committing
- Ensure all tests pass with `npm test`

### Version Management

When updating versions:
1. Update `package.json` version field
2. Add/update the version mapping in `versions.json` if minAppVersion changes
3. Run `npm run sync-versions` to sync versions to manifest.json

### Testing

- Write tests for new features
- Ensure all existing tests pass
- Aim for good test coverage
- Tests are located in the `tests/` directory

## Submitting Changes

1. **Sync versions**: Run `npm run sync-versions` if you changed version numbers
2. **Run tests**: Ensure `npm test` passes
3. **Run linter**: Ensure `npm run lint` passes
4. **Commit**: Write clear commit messages
5. **Push**: Push to your fork
6. **Pull Request**: Create a PR with a clear description

### Pull Request Guidelines

- Provide a clear description of changes
- Reference any related issues
- Ensure CI checks pass
- Update documentation if needed
- Add tests for new features

## Project Structure

```
xmind-to-canvas/
├── src/              # Source code
│   ├── core/         # Core conversion logic
│   └── main.ts       # Obsidian plugin entry point
├── tests/            # Test files
├── web/              # Web version files
├── scripts/          # Build and utility scripts
└── .github/          # GitHub workflows and templates
```

## Reporting Issues

When reporting issues, please include:
- Obsidian version
- Plugin version
- Steps to reproduce
- Expected vs actual behavior
- Error messages (if any)

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Help others learn and grow

Thank you for contributing! 🎉

