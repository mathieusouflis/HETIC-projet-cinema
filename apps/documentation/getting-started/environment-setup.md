# 🔧 Environment Setup

Get your machine ready for Cinema API development. Keep this setup boring and repeatable.

### 1) Install the basics

You need:

* Node.js **20+**
* pnpm
* Git

If you haven’t set up your editor yet, start with:

* [Tools & Setup](../developer/tools-and-setup/)

If you’re on Windows, use WSL for a smoother Node/Postgres workflow:

* [Windows Setup](../developer/tools-and-setup/computer-setup/windows-setup.md)
* [WSL for VS Code](../developer/tools-and-setup/tools-documentation/wsl-for-vscode.md)

### 2) Clone and install

```bash
git clone https://github.com/mathieusouflis/HETIC-projet-cinema.git
cd HETIC-projet-cinema
pnpm install
```

### 3) Configure environment variables

Start from the template shipped in the repo:

```bash
cp apps/api/.env.example apps/api/.env
```

Minimal variables you’ll typically need:

* Database connection (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`)
* JWT secret (`JWT_SECRET`)
* API runtime (`NODE_ENV`, `BACKEND_PORT`)

{% hint style="warning" %}
Never commit `.env`. Keep secrets out of git history.
{% endhint %}

### 4) Sanity check

Once the database is configured, continue with:

* [Database Setup](database-setup.md)
* [Running the API](running-the-api.md)
