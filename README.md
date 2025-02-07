# MCP (Model Context Protocol) Configuration Editor

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](CHANGELOG.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A desktop application for managing Model Context Protocol (a.k.a. MCP) server configurations. This tool provides a user-friendly interface for editing and managing MCP server settings, making it easier to work with AI apps like Claude Desktop that support the Model Context Protocol.

![MCP Config Editor Screenshot](docs/assets/screenshots/mcp_config_editor_screenshot.PNG)

## What problem does this solve?

Other fancier MCP server management tools are already out there.  However many MCP users are not software developers (or are just impatient like me). So this is just a simple configuration app that doesn't require any cryptic command line stuff (docker, node, python, etc.) to get up and running.

Toolbase is another good option: [https://github.com/Toolbase-AI/toolbase](https://github.com/Toolbase-AI/toolbase)

The main difference between this and Toolbase is that this app is more of a general MCP configuration file manager, while Toolbase is focused on streamlining setup for a curated list of popular servers.  If this app still looks a little too complicated, you should try Toolbase first!

Hopefully Claude Desktop will just add something like this to the app soon to make MCP setup a little more accessible.

## Features

This app lets you:
- Paste JSON from a server's Readme file and it will be added to your servers
- Edit specific fields in each configuration
- Save and export configurations
- Add server details manually instead of using JSON

## Installation

### Windows
Download the latest `MCP Config Editor-Windows-[version]-Setup.exe` from the [Releases](../../releases) page and run the installer.

### Other Platforms
We welcome contributions to help build and test installers for:
- macOS (.dmg)
- Linux (.AppImage)

If you'd like to help with platform support, please check our [Contributing Guide](CONTRIBUTING.md).

## Getting Started

Please see [this link](https://modelcontextprotocol.io/quickstart/user) first, if you're using Claude Desktop and this is your first time setting up a MCP server configuration file.

## Development

This project uses:
- [Electron](https://www.electronjs.org/) for the desktop application
- [React](https://reactjs.org/) for the UI framework
- [TypeScript](https://www.typescriptlang.org/) for type safety
- [Vite](https://vitejs.dev/) for build tooling
- [Radix UI](https://www.radix-ui.com/) for UI components
- [Tailwind CSS](https://tailwindcss.com/) for styling

### Development Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/mcp-config-editor.git

# Navigate to the project directory
cd mcp-config-editor

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes and version history.
