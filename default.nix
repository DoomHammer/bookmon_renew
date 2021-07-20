{ pkgs ? import (
  builtins.fetchTarball {
    url = "https://github.com/nixos/nixpkgs/archive/release-20.09.tar.gz";
    sha256 = "12azgdf3zihlxqiw33dx0w9afhgzka8pqha4irp7sn0jgka0zyxs";
  }
) {} }:

with pkgs;

mkShell {
  buildInputs = [
    chromium
    nodejs
  ];
  shellHook = ''
    ln -sf $(which chromium) node_modules/puppeteer/.local-chromium/linux-*/chrome-linux/chrome
  '';
}
