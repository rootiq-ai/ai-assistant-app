# Contributing to MCP Assistant

Thank you for your interest in contributing to MCP Assistant! 🎉

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/kamalsinghbisht/mcp-assistant-app/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Grafana version
   - Browser and OS information

### Suggesting Features

1. Check existing [Issues](https://github.com/kamalsinghbisht/mcp-assistant-app/issues) for similar suggestions
2. Create a new issue with the "feature request" label
3. Describe the feature and its use case

### Pull Requests

1. Fork the repository
2. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes
4. Test your changes locally:
   ```bash
   npm run build
   # Copy to Grafana plugins and test
   ```
5. Commit with a clear message:
   ```bash
   git commit -m "Add: brief description of changes"
   ```
6. Push and create a Pull Request

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/mcp-assistant-app.git
cd mcp-assistant-app

# Install dependencies
npm install

# Build
npm run build

# Watch mode for development
npm run dev
```

## Code Style

- Use TypeScript
- Follow existing code patterns
- Add comments for complex logic
- Keep functions small and focused

## Commit Messages

Use clear, descriptive commit messages:
- `Add: new feature description`
- `Fix: bug description`
- `Update: what was updated`
- `Refactor: what was refactored`
- `Docs: documentation changes`

## Questions?

Feel free to open an issue for any questions!

Thank you for contributing! 🙏
