# Transparent tmux wrapper for Claude Code. Sourced by ../.zshrc.
#
# Interactive `claude` runs inside tmux; everything else (pipes, hooks, MCP
# servers, Claude's own Bash tool) reaches the real binary untouched.
# Escape hatch: CLAUDE_NO_TMUX=1 claude ...

# Resolved HERE, at file scope, where $0 is this script's path. Inside the
# function $0 is the function *name* instead, so the config would be unfindable.
typeset -g _CLAUDE_TMUX_CONF=${0:A:h}/tmux.conf

claude() {
  emulate -L zsh

  local real=$commands[claude]
  if [[ -z $real ]]; then
    print -ru2 -- "claude: not found on PATH"
    return 127
  fi

  # --- bail out whenever tmux would be wrong or impossible -----------------
  #   $TMUX          already inside tmux (incl. Claude's own Bash tool calls)
  #   ! -t 0 / -t 1  piped or spawned as a subprocess (hooks, MCP, `| jq`)
  #   no tmux        nothing to wrap with
  if [[ -n $TMUX || -n $CLAUDE_NO_TMUX || ! -t 0 || ! -t 1 || -z $commands[tmux] ]]; then
    "$real" "$@"
    return
  fi

  # Headless and short-lived modes must stay in the caller's pipeline.
  local a
  for a in "$@"; do
    case $a in
      -p|--print|--version|--help|-h|mcp|update|install|doctor|setup-token)
        "$real" "$@"; return ;;
    esac
  done

  # --- markers that must NEVER reach a fresh top-level claude ---------------
  # Claude Code stamps these into every subprocess it spawns. Inheriting them
  # makes the new session think it is a *child* session, which silently turns
  # OFF transcript saving (and CLAUDE_EFFORT would pin its reasoning effort).
  # Deliberate config (ANTHROPIC_*, CLAUDE_CONFIG_DIR, CLAUDE_CODE_USE_BEDROCK,
  # …) is NOT in this list and is forwarded normally.
  local -a strip=(
    CLAUDECODE CLAUDE_CODE_ENTRYPOINT CLAUDE_CODE_EXECPATH
    CLAUDE_CODE_SESSION_ID CLAUDE_CODE_CHILD_SESSION
    CLAUDE_PID CLAUDE_EFFORT CLAUDE_CODE_SSE_PORT
  )

  # --- forward the LIVE environment ----------------------------------------
  # A session on a pre-existing tmux server would inherit that server's frozen
  # env (no mise/nvm PATH, no secreq-injected token). -e replays ours on top.
  local -a envargs
  local kv nm
  while IFS= read -r -d '' kv; do
    nm=${kv%%=*}
    [[ $nm == *[^A-Za-z0-9_]* || -z $nm ]] && continue
    case $nm in (TMUX|TMUX_PANE|TERM|_|SHLVL|PWD|OLDPWD) continue ;; esac
    (( $strip[(I)$nm] )) && continue
    envargs+=(-e "$kv")
  done < <(env -0)
  envargs+=(-e "CLAUDE_IN_TMUX=1")

  # Filtering the -e list is not enough on its own: -e is ADDITIVE, so it can
  # override a variable but never delete one. Markers sitting in the tmux
  # server's own environment (server started from a poisoned shell) would still
  # leak in, and they cannot be scrubbed beforehand -- a server with no sessions
  # exits immediately, so there is no window in which to run set-environment.
  # Unsetting inside the pane's shell, just before exec'ing claude, is the one
  # place that is guaranteed to run after every environment source has merged.
  local sanitize="unset ${(j: :)strip};"

  # --- unique, human-named session per launch ------------------------------
  local name=${PWD:t}
  name=${name//[^a-zA-Z0-9._-]/-}
  if tmux -L claude has-session -t "=$name" 2>/dev/null; then
    name=$name-$$
  fi

  # --- run it, and recover the real exit status ----------------------------
  local rcfile=$(mktemp -t claude-tmux)
  tmux -L claude -f "$_CLAUDE_TMUX_CONF" \
    new-session -s "$name" -c "$PWD" $envargs -- \
    "$sanitize ${(q)real} ${(q)@}; printf %s \$? > ${(q)rcfile}"

  local st=''
  [[ -s $rcfile ]] && st=$(<$rcfile)
  rm -f -- $rcfile
  [[ $st == <-> ]] || st=0     # detached (not exited) -> treat as success
  return $st
}

# List claude tmux sessions, or reattach to one: `cct` / `cct brain`
cct() {
  if (( $# )); then
    tmux -L claude attach -t "$1"
  else
    tmux -L claude ls 2>/dev/null || print -- "no claude sessions"
  fi
}
