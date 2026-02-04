{ pkgs, lib, config, inputs, ... }:

let
  azure = "\\033[38;5;39m";
  green = "\\033[38;5;46m";
  reset = "\\033[0m";
in
{
  # https://devenv.sh/basics/
  # env.GREET = "devenv";

  # https://devenv.sh/packages/
  packages = [
    pkgs.git
    pkgs.pnpm
    pkgs.nodejs_24
    pkgs.postgresql
    pkgs.docker
    pkgs.phase-cli
  ];

  # https://devenv.sh/languages/
  languages.typescript.enable = true;

  # https://devenv.sh/processes/
  # processes.dev.exec = "${lib.getExe pkgs.watchexec} -n -- ls -la";

  processes.dockerd.exec = "dockerd";

  # https://devenv.sh/services/
  # services.postgres.enable = true;

  # https://devenv.sh/scripts/
  # scripts.hello.exec = ''
  #   echo hello from $GREET
  # '';

  # https://devenv.sh/basics/
  enterShell = ''
    clear
    echo
    echo "$(tput bold)░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░$(tput sgr0)"
    echo -e "$(tput bold)░░█▀░░░${azure}█${reset}░${azure}█${reset}░${azure}▀█${reset}░░${azure}█${reset}░${azure}█${reset}░░░${green}█▀▀${reset}░${green}█${reset}░${green}█${reset}░${green}█▀▀${reset}░${green}█${reset}░░░${green}█${reset}░░░░░▀█░░$(tput sgr0)"
    echo -e "$(tput bold)░▀▄░░░░${azure}▀▄▀${reset}░░${azure}█${reset}░░░${azure}▀█${reset}░░░${green}▀▀█${reset}░${green}█▀█${reset}░${green}█▀▀${reset}░${green}█${reset}░░░${green}█${reset}░░░░░░▄▀░$(tput sgr0)"
    echo -e "$(tput bold)░░▀▀░░░░${azure}▀${reset}░░${azure}▀▀▀${reset}░░░${azure}▀${reset}░░░${green}▀▀▀${reset}░${green}▀${reset}░${green}▀${reset}░${green}▀▀▀${reset}░${green}▀▀▀${reset}░${green}▀▀▀${reset}░░░▀▀░░$(tput sgr0)"
    echo "$(tput bold)░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░$(tput sgr0)"
    echo
  '';

  # https://devenv.sh/tasks/
  # tasks = {
  #   "myproj:setup".exec = "mytool build";
  #   "devenv:enterShell".after = [ "myproj:setup" ];
  # };

  # https://devenv.sh/tests/
  # enterTest = ''
  #   echo "Running tests"
  #   git --version | grep --color=auto "${pkgs.git.version}"
  # '';

  # dotenv.enable = true;
  # dotenv.filename = ".env.local";

  # https://devenv.sh/git-hooks/
  # git-hooks.hooks.shellcheck.enable = true;

  # https://devenv.sh/binary-caching/
  cachix.enable = false;

  # See full reference at https://devenv.sh/reference/options/
}
