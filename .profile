## Holds settings that can be applied to all shells. POSIX-compliant.

export PATH="$DOTFILES_DIR_HOME/scripts:$PATH"

alias nx='npx nx'

## SSH agent setup is OS-specific — see .profile.osx / .profile.linux
## (loaded at the bottom of this file). Don't add an unconditional
## `eval "$(ssh-agent -s)"` here: this file is sourced per-shell and
## would leak an agent process for every terminal.

## Runs a command with GitHub CLI auth exported for tools that expect token env vars.
with_gh_auth() {
  _gh_token=$(gh auth token) || return
  GITHUB_TOKEN="$_gh_token" GH_TOKEN="$_gh_token" "$@"
}

alias codex-gh='with_gh_auth codex'
alias claude-gh='with_gh_auth claude'

## Walks upward from $PWD and prepends every node_modules/.bin to PATH.
## Called on shell start and after each `cd`.
refresh_node_bin_path() {
  # Strip any previously-added node_modules/.bin entries
  PATH=$(printf '%s\n' "$PATH" | tr ':' '\n' | grep -v '/node_modules/\.bin$' | tr '\n' ':')
  PATH="${PATH%:}" # remove trailing colon

  _node_bins=""
  _dir="$PWD"
  while true; do
    if [ -d "$_dir/node_modules/.bin" ]; then
      _node_bins="$_dir/node_modules/.bin:$_node_bins"
    fi
    # Stop at filesystem root
    [ "$_dir" = "/" ] && break
    _dir=$(dirname "$_dir")
  done

  if [ -n "$_node_bins" ]; then
    PATH="${_node_bins%:}:$PATH"
    echo "[dotfiles] Added to PATH: ${_node_bins%:}" >&2
  fi
  export PATH
}

refresh_node_bin_path

## Sources a local shell rc file if one exists in $PWD
source_local_rc() {
  if [ "$PWD" != "$DOTFILES_DIR_HOME" ] && [ "$PWD" != "$HOME" ] && [ -f ".${SHELL_NAME}rc" ]; then
    echo "[dotfiles] Sourcing local .${SHELL_NAME}rc in $PWD" >&2
    . "./.${SHELL_NAME}rc"
  fi
}

## Overrides cd to refresh node_modules/.bin PATH and source local rc files
cd() {
  builtin cd "$@" || return
  refresh_node_bin_path
  source_local_rc
}

source_local_rc

## Load OS-specific extensions
case "$(uname -s)" in
  Darwin)
    [ -f "$DOTFILES_DIR_HOME/.profile.osx" ] && . "$DOTFILES_DIR_HOME/.profile.osx"
    ;;
  Linux)
    [ -f "$DOTFILES_DIR_HOME/.profile.linux" ] && . "$DOTFILES_DIR_HOME/.profile.linux"
    ;;
esac

## mise — runtime version manager (node, python, …).
## Installed to ~/.local/bin, which is not on PATH until mise itself activates,
## so fall back to that path when `command -v` comes up empty. $MISE_SHELL is
## set by the activation snippet; re-running it in a nested shell is wasteful.
if [ -z "$MISE_SHELL" ]; then
  _mise=$(command -v mise 2>/dev/null) || _mise="$HOME/.local/bin/mise"
  if [ -x "$_mise" ]; then
    eval "$("$_mise" activate "${SHELL_NAME:-bash}")"
  fi
  unset _mise
fi
