# Computer Setup

This page walks you through installing every tool you need on a fresh machine before following the [Quick Start](README.md).

---

## Required tools

| Tool | Version | Purpose |
|------|---------|---------|
| [VS Code](https://code.visualstudio.com/download) | latest | Recommended editor |
| [Node.js](https://nodejs.org/en/download) | >= 20 (LTS) | JavaScript runtime |
| pnpm | 10.28.2 | Package manager (the only supported one) |
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | any recent | PostgreSQL container |
| Git | any recent | Version control |

---

## macOS

### 1. Install Homebrew (if you don't have it)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. Install Node.js and Docker

```bash
brew install node
brew install --cask docker
```

Open Docker Desktop at least once so the daemon starts.

### 3. Install pnpm via Corepack

```bash
corepack enable
corepack prepare pnpm@10.28.2 --activate
```

Verify:

```bash
node --version   # >= 20
pnpm --version   # 10.28.2
docker --version
```

---

## Windows (WSL2 + Nix + Devenv — recommended)

The recommended Windows setup uses WSL2 to get a Linux environment, then Nix + Devenv to manage all project tools automatically. This mirrors exactly what macOS team members use.

### 1. Install WSL2

Open PowerShell as Administrator and run:

```powershell
wsl --install
```

Restart when prompted. On first launch, create a Unix username and password.

To launch WSL:

```bash
wsl
# or target a specific distro:
wsl -d Ubuntu
```

All remaining steps are run inside WSL (the Linux terminal), not PowerShell.

### 2. Install Nix

```bash
sh <(curl -L https://nixos.org/nix/install) --daemon
```

Close and reopen your terminal after installation completes.

### 3. Install Devenv

```bash
nix-env -iA nixpkgs.devenv
```

[Devenv](https://devenv.sh) uses the project's `devenv.nix` to automatically provide Node.js, pnpm, Docker, and `phase-cli` at the exact versions declared — no manual version management needed.

### 4. Install and hook Direnv

```bash
# Install
curl -sfL https://direnv.net/install.sh | bash

# Hook into your shell (bash example)
echo 'eval "$(direnv hook bash)"' >> ~/.bashrc
source ~/.bashrc
```

If you use zsh, fish, or another shell, see [direnv docs → hook](https://direnv.net/docs/hook.html) for the correct line.

Once both are installed, entering the project directory triggers `direnv allow` and the full Nix environment activates automatically.

### 5. Install the VS Code WSL extension

Install the **WSL** extension (`ms-vscode-remote.remote-wsl`) in VS Code. This lets VS Code run inside the WSL filesystem with full Linux tooling.

To connect:
1. Click the green `><` button in the bottom-left corner of VS Code
2. Choose **Connect to WSL using Distro…**
3. Select **Ubuntu** (or your distro)
4. Open your project folder from the WSL filesystem (`/home/<user>/...`)

> Always open the project from within WSL, not from the Windows filesystem (`/mnt/c/...`). File I/O and file watchers are significantly slower from the Windows mount.

### 6. Install Node.js and pnpm (if not using Devenv)

If you prefer not to use Devenv, install manually inside WSL:

```bash
# Node.js via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20

# pnpm via Corepack
corepack enable
corepack prepare pnpm@10.28.2 --activate
```

### 7. Install Docker

Install [Docker Desktop for Windows](https://docs.docker.com/desktop/setup/install/windows-install/). In Docker Desktop settings, enable **"Use the WSL 2 based engine"** and check the box for your WSL distro under **Resources → WSL Integration**.

Verify inside WSL:

```bash
docker ps
```

---

## VS Code extensions

Install these for the best development experience:

| Extension | ID | Purpose |
|---|---|---|
| ESLint / Biome | `biomejs.biome` | Linting and formatting |
| Prettier (disabled) | — | Disabled in favour of Biome |
| TailwindCSS IntelliSense | `bradlc.vscode-tailwindcss` | Class autocomplete |
| Drizzle ORM | `drizzle-team.drizzle-vscode` | Schema highlighting |
| REST Client | `humao.rest-client` | Test API endpoints from `.http` files |
| GitLens | `eamodio.gitlens` | Git history and blame |
| WSL | `ms-vscode-remote.remote-wsl` | Windows only |

To install from the command line:

```bash
code --install-extension biomejs.biome
code --install-extension bradlc.vscode-tailwindcss
code --install-extension eamodio.gitlens
```

---

## Recommended VS Code settings

Add to your `.vscode/settings.json` (or user settings):

```json
{
  "editor.defaultFormatter": "biomejs.biome",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "quickfix.biome": "explicit"
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

---

## Next step

Once your tools are installed, follow the [Quick Start](README.md) to clone, configure, and run the project.
