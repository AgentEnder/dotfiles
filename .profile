## Holds settings that can be applied to all shells. POSIX-compliant.

export PATH="$DOTFILES_DIR_HOME/scripts:$PATH"

alias nx='npx nx'

eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

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
    . ".${SHELL_NAME}rc"
  fi
}

## Overrides cd to refresh node_modules/.bin PATH and source local rc files
cd() {
  builtin cd "$@" || return
  refresh_node_bin_path
  source_local_rc
}

source_local_rc
