# Contributing to MCP Config Editor

We love your input! We want to make contributing to MCP Config Editor as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

### Platform Support

We currently need help with building and testing installers for:
- macOS (.dmg installer)
- Linux (.AppImage)

To help with platform support:
1. Set up a development environment on the target platform
2. Test the build process using `npm run build`
3. Test the generated installer
4. Document any platform-specific requirements or issues
5. Submit a PR with your findings and any necessary changes

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code lints
6. Issue that pull request!

## Build Process

The application can be built for different platforms:
```bash
# Install dependencies
npm install

# Build installers
npm run build
```

This will create platform-specific installers in the `release/[version]` directory:
- Windows: `MCP Config Editor-Windows-[version]-Setup.exe`
- macOS: `MCP Config Editor-Mac-[version]-Installer.dmg`
- Linux: `MCP Config Editor-Linux-[version].AppImage`

Note: Each platform's installer can only be built on that platform (e.g., .dmg installers must be built on macOS).

## Local Development Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/mcp-config-editor.git
cd mcp-config-editor
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

## Pull Request Process

1. Update the README.md with details of changes to the interface, if applicable
2. Update the CHANGELOG.md with notes on your changes
3. The PR will be merged once you have the sign-off of at least one other developer

## Any contributions you make will be under the MIT Software License
In short, when you submit code changes, your submissions are understood to be under the same [MIT License](LICENSE) that covers the project. Feel free to contact the maintainers if that's a concern.

## Report bugs using GitHub's [issue tracker](../../issues)
We use GitHub issues to track public bugs. Report a bug by [opening a new issue](../../issues/new).

## Write bug reports with detail, background, and sample code

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## License
By contributing, you agree that your contributions will be licensed under its MIT License.
