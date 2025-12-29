# Windows setup

{% stepper %}
{% step %}

## Install and setup WSL2

#### Install WSL

```bash
wsl --install
```

#### Launch WSL in your terminal

```zsh
wsl
```

```zsh
wsl -d Ubuntu
```

{% hint style="info" %}
At the first launch of wsl on your computer you'll be asked to create a user.
{% endhint %}
{% endstep %}

{% step %}

## Install NixOs

```bash
sh <(curl -L https://nixos.org/nix/install) --daemon
```

{% hint style="info" %}
Close and re open your terminal after installation
{% endhint %}
{% endstep %}

{% step %}

## Install Devenv

```bash
nix-env -iA nixpkgs.devenv
```

{% endstep %}

{% step %}

## Install and enable Direnv

#### Installation

```bash
curl -sfL https://direnv.net/install.sh | bash
```

#### Enable Direnv

Enter in the bash config

```bash
# Open your terminal configuration
nano ~/.bashrc
```

{% hint style="info" %}
If your'r not using bash go here to find what you have to do : [https://direnv.net/docs/hook.html](https://direnv.net/docs/hook.html)
{% endhint %}

Add the following line at the <mark style="color:red;">**end**</mark> of the `~/.bashrc` file:

```zsh
eval "$(direnv hook bash)"
```

{% endstep %}

{% step %}

## Install WSL VSCode extension

{% hint style="info" %}
[https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-wsl](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-wsl)
{% endhint %}

<figure><img src="../../../.gitbook/assets/Screenshot 2025-12-22 at 18.33.50.png" alt=""><figcaption></figcaption></figure>

{% content-ref url="../tools-documentation/wsl-for-vscode.md" %}
[wsl-for-vscode.md](../tools-documentation/wsl-for-vscode.md)
{% endcontent-ref %}
{% endstep %}
{% endstepper %}
