#!/usr/bin/env zsh
## Secondary Chrome instances, each with its own Cmd+Tab icon.
##
## The bundles are badged clones of Google Chrome BETA built by
## ~/dotfiles/scripts/chrome-skin and kept current by the
## com.craigory.chrome-skin-sync LaunchAgent. They are the identical notarized
## Google binary, so the "this browser may not be secure" sign-in gate does not
## fire and each profile's Safe Storage keychain item still decrypts its cookies.
##
## They clone Beta rather than stable on purpose. LaunchServices resolves the
## default browser to a bundle *identifier* and picks the highest-versioned
## claimant, so clones of stable (com.google.Chrome) could — and did — outrank
## /Applications/Google Chrome.app and swallow every Cmd-clicked terminal link
## and Slack link into a CDP automation profile. Beta's id is
## com.google.Chrome.beta, which is never a candidate for the stable handler.
##
##   chrome-cdp                 list instances and their state
##   chrome-cdp familysearch    launch (or report) and wait for CDP to answer
##   chrome-cdp -H automation   launch headless — no Cmd+Tab entry at all
##
## -H sets --headless=new, which keeps full CDP but reports a HeadlessChrome
## user-agent. Do not use it for anything that has to log in; that UA is one of
## the signals Google's sign-in gate rejects.

typeset -gA _CHROME_CDP_APP=(
  familysearch "Chrome FamilySearch"
  myheritage   "Chrome MyHeritage"
  automation   "Chrome Automation"
)
typeset -gA _CHROME_CDP_PROFILE=(
  familysearch "$HOME/.chrome-familysearch"
  myheritage   "$HOME/.chrome-myheritage"
  automation   "$HOME/.chrome-automation"
)
typeset -gA _CHROME_CDP_PORT=(
  familysearch 9333
  myheritage   9334
  automation   9335
)

chrome-cdp() {
  emulate -L zsh
  setopt local_options no_nomatch

  # The app the clones are built from; chrome-skin reads the same variable.
  local _src="${CHROME_SKIN_SRC:-/Applications/Google Chrome Beta.app}"
  local _srcver=
  _srcver=$(defaults read "${_src}/Contents/Info" CFBundleShortVersionString 2>/dev/null)

  local headless=0
  while [[ ${1:-} == -* ]]; do
    case $1 in
      -H|--headless) headless=1; shift ;;
      -h|--help)
        print -- "usage: chrome-cdp [-H|--headless] [<instance>]"
        print -- "  no args: list instances. -H: headless (no Cmd+Tab entry, HeadlessChrome UA)."
        return 0 ;;
      *) print -u2 "chrome-cdp: unknown flag '$1'"; return 2 ;;
    esac
  done

  local name=${1:-}

  # No argument: report what exists and what is up.
  if [[ -z $name ]]; then
    printf '%-14s %-6s %-9s %-18s %s\n' INSTANCE PORT STATE VERSION PROFILE
    # Declared once: a bare `local x` inside the loop would re-list the
    # parameter on every iteration after the first, printing "x=value".
    local ver=
    for name in ${(ok)_CHROME_CDP_APP}; do
      local bundle="/Applications/${_CHROME_CDP_APP[$name]}.app"
      local state=stopped
      [[ -d $bundle ]] || state=no-bundle
      if pgrep -f "${bundle}/Contents/MacOS/" >/dev/null 2>&1; then
        state=running
      fi
      ver=$(defaults read "${bundle}/Contents/Info" CFBundleShortVersionString 2>/dev/null) || ver=-
      # Trailing * means the clone has drifted from the app it was built from.
      [[ -n $_srcver && $ver != - && $ver != $_srcver ]] && ver="${ver}*"
      printf '%-14s %-6s %-9s %-18s %s\n' \
        "$name" "$_CHROME_CDP_PORT[$name]" "$state" "$ver" "$_CHROME_CDP_PROFILE[$name]"
    done
    [[ -n $_srcver ]] && print -- "\n${_src:t:r} is on $_srcver;  * = clone drifted, run chrome-skin-sync"
    return 0
  fi

  local app=${_CHROME_CDP_APP[$name]:-}
  if [[ -z $app ]]; then
    print -u2 "chrome-cdp: unknown instance '$name' (have: ${(ok)_CHROME_CDP_APP})"
    return 2
  fi

  local bundle="/Applications/${app}.app"
  local port=$_CHROME_CDP_PORT[$name]
  local profile=$_CHROME_CDP_PROFILE[$name]

  if [[ ! -d $bundle ]]; then
    print -u2 "chrome-cdp: $bundle is missing"
    print -u2 "  rebuild it: chrome-skin-sync"
    return 1
  fi

  # A clone carries its own updater, so it drifts from the app it was built from
  # in both directions. Warn rather than block: a drifted clone still runs, it is
  # just not the build chrome-skin last vouched for. chrome-skin-sync cannot
  # replace a clone while it is running, so drift persists until it is quit.
  local _ver=
  _ver=$(defaults read "${bundle}/Contents/Info" CFBundleShortVersionString 2>/dev/null)
  if [[ -n $_srcver && -n $_ver && $_ver != $_srcver ]]; then
    print -u2 "chrome-cdp: $name is on $_ver, ${_src:t:r} is on $_srcver"
    print -u2 "  resync: quit $name, then chrome-skin-sync"
  fi

  if pgrep -f "${bundle}/Contents/MacOS/" >/dev/null 2>&1; then
    print "$name already running"
  else
    local -a args=(
      --user-data-dir=$profile
      --remote-debugging-port=$port
      --no-first-run
      --no-default-browser-check
    )
    (( headless )) && args+=(--headless=new)
    open -na $bundle --args $args || return 1
  fi

  # Poll the endpoint instead of guessing a sleep — cold starts vary a lot,
  # and a stale port answering here means the profile is already claimed.
  local i
  for i in {1..40}; do
    if curl -sf --max-time 1 "http://127.0.0.1:${port}/json/version" >/dev/null 2>&1; then
      print "CDP ready on ${port}  ->  agent-browser connect ${port}"
      return 0
    fi
    sleep 0.25
  done

  print -u2 "chrome-cdp: $name did not open CDP on ${port} within 10s"
  return 1
}

alias chrome-fs='chrome-cdp familysearch'
alias chrome-mh='chrome-cdp myheritage'

# Completion is best-effort: compinit may not have run yet in every shell.
if (( $+functions[compdef] )); then
  compdef '_values instance ${(k)_CHROME_CDP_APP}' chrome-cdp
fi
