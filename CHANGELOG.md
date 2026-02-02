# Changelog

All notable changes to the MCP Assistant Grafana plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-02-01

### Added
- 🎉 Initial release
- 🤖 Universal MCP client for any MCP server
- 🚀 SSE (Server-Sent Events) streaming for real-time responses
- 📊 Inline chart display support
- 🔵 Professional blue/dark theme
- 💬 Floating sidebar accessible on all Grafana pages
- ⚙️ Simple configuration (MCP Server URL only)
- ⌨️ Keyboard shortcuts (Ctrl+B to toggle, Enter to send)
- 🗑️ Clear chat functionality
- 📱 Responsive design for mobile
- 🔌 HTTP fallback when SSE is unavailable
- 💾 Persistent settings via localStorage

### Features
- Natural language queries to MCP server
- Real-time typing effect during response streaming
- Quick suggestion chips for common queries
- Connection status indicator with visual feedback
- Auto-reconnect on connection loss
- Preload support for automatic sidebar injection

### Technical
- TypeScript source code
- Webpack build system
- Grafana 9.0+ compatibility
- Apache 2.0 license
