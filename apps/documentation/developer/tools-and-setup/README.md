---
description: >-
  Complete tools and setup guide for Cinema Project development - IDE
  configuration, extensions, and productivity tools
---

# 🛠️ Tools & Setup

This section provides comprehensive guidance for setting up your development environment for the Cinema Project. Whether you're on Windows, macOS, or Linux, we'll help you get everything configured for optimal productivity.

## 🎯 Overview

A well-configured development environment is crucial for productive work on the Cinema Project. This guide covers:

* **IDE Setup** - Visual Studio Code configuration and extensions
* **Development Tools** - Essential tools for daily development
* **Platform-Specific Setup** - Windows, macOS, and Linux configurations
* **Productivity Enhancements** - Tips and tricks for efficient development

## 🚀 Quick Setup Checklist

Before diving into the detailed guides, ensure you have these essentials:

### Prerequisites

* [ ] **Node.js 20+** installed
* [ ] **pnpm** package manager
* [ ] **Git** version control
* [ ] **PostgreSQL 14+** database
* [ ] **Visual Studio Code** (recommended IDE)
* [ ] **Docker** (optional, for containerized development)

### Verification

```bash
# Verify installations
node --version    # Should show v20.x.x or higher
pnpm --version    # Should show latest version
git --version     # Any recent version
psql --version    # Should show v14.x or higher
code --version    # VS Code version
docker --version  # Docker version (if using)
```

## 🛠️ Development Environment Options

### Option 1: Local Development (Recommended)

* **Best for**: Day-to-day development, debugging, testing
* **Pros**: Full control, best performance, offline work
* **Cons**: Requires local setup, potential environment differences

### Option 2: Containerized Development

* **Best for**: Consistent environments, team development
* **Pros**: Identical environments, easy cleanup, isolation
* **Cons**: Slightly slower, requires Docker knowledge

### Option 3: Cloud Development (Advanced)

* **Best for**: Remote work, powerful cloud instances
* **Pros**: Consistent environments, powerful hardware
* **Cons**: Internet dependency, potential latency

## 📋 Setup Guides

### [Computer Setup](computer-setup/)

Platform-specific installation and configuration guides:

#### [Windows Setup](computer-setup/windows-setup.md)

Complete Windows development environment setup including:

* **WSL2 Configuration** - Windows Subsystem for Linux setup
* **Node.js Installation** - Using nvm for Windows or direct installation
* **PostgreSQL Setup** - Database installation and configuration
* **Git Configuration** - SSH keys and global settings
* **Performance Optimization** - Windows-specific tweaks

#### macOS Setup

macOS development environment configuration:

* **Homebrew Installation** - Package manager setup
* **Node.js via nvm** - Version management
* **PostgreSQL via Homebrew** - Database setup
* **Xcode Command Line Tools** - Essential development tools
* **Terminal Enhancement** - iTerm2 and shell improvements

#### Linux Setup

Linux development environment setup:

* **Package Manager Setup** - apt, yum, or pacman configuration
* **Node.js Installation** - Using nvm or package manager
* **PostgreSQL Configuration** - Service setup and user management
* **Development Tools** - Essential Linux development packages

### [Tools Documentation](tools-documentation/)

Detailed documentation for development tools and integrations:

#### [WSL for VS Code](tools-documentation/wsl-for-vscode.md)

Windows Subsystem for Linux integration with Visual Studio Code:

* **WSL Extension Setup** - Remote development configuration
* **File System Integration** - Working with WSL file systems
* **Terminal Integration** - Using WSL terminals in VS Code
* **Performance Tips** - Optimizing WSL development workflow

#### IDE Extensions and Configuration

Essential VS Code extensions and settings for the project:

* **Language Support** - TypeScript, JavaScript, JSON
* **Framework Extensions** - React, Next.js, Express
* **Database Tools** - PostgreSQL, SQL formatting
* **Git Integration** - GitLens, Git Graph
* **Productivity Tools** - Auto-formatting, linting, snippets

## 🔧 Essential Tools

### Code Editor: Visual Studio Code

**Why VS Code?**

* Excellent TypeScript support
* Rich extension ecosystem
* Integrated terminal and debugger
* Git integration
* Remote development capabilities

**Essential Extensions:**

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode.eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json",
    "GitLens.gitlens",
    "ms-vscode-remote.remote-wsl",
    "rangav.vscode-thunder-client",
    "drizzle-team.drizzle-vscode"
  ]
}
```

### Package Manager: pnpm

**Why pnpm?**

* Faster installation and execution
* Efficient disk space usage
* Strict dependency management
* Monorepo support
* Compatible with npm ecosystem

**Installation:**

```bash
# Install pnpm globally
npm install -g pnpm

# Or via curl
curl -fsSL https://get.pnpm.io/install.sh | sh

# Verify installation
pnpm --version
```

### Database: PostgreSQL

**Why PostgreSQL?**

* Robust SQL database with advanced features
* Excellent JSON support
* Strong consistency and ACID compliance
* Great tooling ecosystem
* Free and open source

**Management Tools:**

* **pgAdmin** - Web-based administration
* **TablePlus** - Native GUI client (paid)
* **DBeaver** - Free, cross-platform client
* **Drizzle Studio** - Built-in ORM studio (`pnpm db:studio`)

### API Testing: Thunder Client (VS Code) / Postman

**Thunder Client (Recommended for VS Code users):**

* Built into VS Code
* Lightweight and fast
* Environment support
* Collection sharing

**Postman (Alternative):**

* Comprehensive API testing
* Team collaboration features
* Advanced scripting capabilities
* Mock servers

## 🎨 IDE Configuration

### VS Code Settings

Create or update `.vscode/settings.json` in the project root:

```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  },
  "eslint.workingDirectories": ["apps/api", "apps/front"],
  "typescript.preferences.includePackageJsonAutoImports": "off",
  "editor.rulers": [80, 120],
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.turbo": true
  }
}
```

### VS Code Launch Configuration

Create `.vscode/launch.json` for debugging:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug API",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/apps/api/src/server.ts",
      "outFiles": ["${workspaceFolder}/apps/api/dist/**/*.js"],
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal",
      "restart": true,
      "runtimeArgs": ["-r", "ts-node/register"]
    },
    {
      "name": "Debug Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/vitest",
      "args": ["run", "--reporter=verbose"],
      "console": "integratedTerminal",
      "env": {
        "NODE_ENV": "test"
      }
    }
  ]
}
```

### VS Code Tasks

Create `.vscode/tasks.json` for common tasks:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start Development",
      "type": "shell",
      "command": "pnpm dev",
      "group": {
        "kind": "build",
        "isDefault": true
      },
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      },
      "problemMatcher": []
    },
    {
      "label": "Run Tests",
      "type": "shell",
      "command": "pnpm test",
      "group": "test",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      }
    },
    {
      "label": "Database Studio",
      "type": "shell",
      "command": "pnpm db:studio",
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      }
    }
  ]
}
```

## 🔍 Development Workflow Tools

### Git Configuration

```bash
# Set global configuration
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Set default branch name
git config --global init.defaultBranch main

# Enable helpful aliases
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.st status
git config --global alias.lg "log --oneline --decorate --all --graph"
```

### Terminal Enhancement

**For macOS/Linux (using Oh My Zsh):**

```bash
# Install Oh My Zsh
sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

# Add useful plugins to ~/.zshrc
plugins=(git node npm yarn docker)

# Install useful aliases
alias ll="ls -la"
alias la="ls -la"
alias ..="cd .."
alias ...="cd ../.."
```

**For Windows (PowerShell):**

```powershell
# Install PowerShell modules
Install-Module -Name PSReadLine -Force
Install-Module -Name posh-git -Force

# Add to PowerShell profile
Import-Module posh-git
Set-PSReadLineOption -PredictionSource History
```

## 📊 Performance Monitoring Tools

### Development Performance

* **Node.js Inspector** - Built-in debugging and profiling
* **Clinic.js** - Performance monitoring toolkit
* **0x** - Flamegraph profiler

### Database Performance

* **Drizzle Studio** - Query inspection and data browsing
* **PostgreSQL Query Planner** - Built-in query analysis
* **pgAnalyze** - Advanced PostgreSQL monitoring (optional)

### API Testing and Monitoring

* **Thunder Client Collections** - API endpoint testing
* **Artillery** - Load testing (for performance testing)
* **Lighthouse CI** - Frontend performance monitoring

## 🔧 Troubleshooting Common Issues

### VS Code Issues

**TypeScript not working:**

1. Restart TypeScript server: `Cmd/Ctrl + Shift + P` → "TypeScript: Restart TS Server"
2. Check workspace TypeScript version: `Cmd/Ctrl + Shift + P` → "TypeScript: Select TypeScript Version"
3. Ensure project dependencies are installed: `pnpm install`

**Extensions not loading:**

1. Reload window: `Cmd/Ctrl + Shift + P` → "Developer: Reload Window"
2. Check extension compatibility
3. Clear extension cache: `Cmd/Ctrl + Shift + P` → "Developer: Clear Extension Host Cache"

### Node.js Issues

**Permission errors:**

```bash
# Fix npm/pnpm permissions (Linux/macOS)
sudo chown -R $USER:$USER ~/.npm
sudo chown -R $USER:$USER ~/.pnpm

# Or use nvm to manage Node.js versions
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20
```

### Database Connection Issues

**PostgreSQL not starting:**

```bash
# macOS (Homebrew)
brew services start postgresql

# Linux (systemd)
sudo systemctl start postgresql

# Windows (Services)
# Start PostgreSQL service in Windows Services manager
```

## 📚 Additional Resources

### Documentation Links

* [Visual Studio Code Documentation](https://code.visualstudio.com/docs)
* [pnpm Documentation](https://pnpm.io/motivation)
* [PostgreSQL Documentation](https://www.postgresql.org/docs/)
* [Git Documentation](https://git-scm.com/doc)

### Useful Tutorials

* [VS Code Tips and Tricks](https://code.visualstudio.com/docs/getstarted/tips-and-tricks)
* [TypeScript Handbook](https://www.typescriptlang.org/docs/)
* [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

## 🎯 Next Steps

Once you have your tools configured:

1. **Complete Platform Setup** - Follow the appropriate computer setup guide
2. **Clone and Setup Project** - Follow the [Quick Start Guide](../../api-documentation/guides/quick-start.md)
3. **Start Development** - Begin with the [Development Guide](../../api-documentation/development-guide/)
4. **Join the Community** - Participate in code reviews and discussions

## 🤝 Getting Help

If you encounter issues during setup:

* **Check the** [**FAQ**](../../faq.md) for common solutions
* **Search** [**GitHub Issues**](https://github.com/mathieusouflis/HETIC-projet-cinema/issues) for similar problems
* **Ask in** [**GitHub Discussions**](https://github.com/mathieusouflis/HETIC-projet-cinema/discussions)
* **Review platform-specific setup guides** in the Computer Setup section

***

**Ready to set up your environment?** Choose your platform in the [Computer Setup](computer-setup/) section or dive into specific tools in [Tools Documentation](tools-documentation/).
