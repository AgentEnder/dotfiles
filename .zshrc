autoload -U compinit && compinit

export DOTFILES_DIR_HOME=$( cd -- "$( dirname -- "${(%):-%N}" )" &> /dev/null && pwd )
export SHELL_NAME=zsh

source $DOTFILES_DIR_HOME/.profile

source $DOTFILES_DIR_HOME/git-prompt.zsh

# Name: [bash-git-prompt](https://github.com/magicmonty/bash-git-prompt) clone
# Description:
#  This example mimics the [bash-git-prompt](https://github.com/magicmonty/bash-git-prompt)
#  informative git prompt for bash.

ZSH_GIT_PROMPT_FORCE_BLANK=1
ZSH_GIT_PROMPT_SHOW_STASH=1
ZSH_GIT_PROMPT_SHOW_UPSTREAM="symbol"

ZSH_THEME_GIT_PROMPT_PREFIX="%B %b["
ZSH_THEME_GIT_PROMPT_SUFFIX="]"
ZSH_THEME_GIT_PROMPT_SEPARATOR="|"
ZSH_THEME_GIT_PROMPT_BRANCH="%{$fg[magenta]%}"
ZSH_THEME_GIT_PROMPT_UPSTREAM_SYMBOL=" %{$fg_bold[yellow]%}⟳ "
ZSH_THEME_GIT_PROMPT_UPSTREAM_PREFIX="%{$fg[yellow]%} ⤳ "
ZSH_THEME_GIT_PROMPT_UPSTREAM_SUFFIX=""
ZSH_THEME_GIT_PROMPT_DETACHED="%{$fg_no_bold[cyan]%}:"
ZSH_THEME_GIT_PROMPT_BEHIND="%{$fg_no_bold[cyan]%}↓"
ZSH_THEME_GIT_PROMPT_AHEAD="%{$fg_no_bold[cyan]%}↑"
ZSH_THEME_GIT_PROMPT_UNMERGED="%{$fg[red]%}✖"
ZSH_THEME_GIT_PROMPT_STAGED="%{$fg[green]%}●"
ZSH_THEME_GIT_PROMPT_UNSTAGED="%{$fg[red]%}✚"
ZSH_THEME_GIT_PROMPT_UNTRACKED="…"
ZSH_THEME_GIT_PROMPT_STASHED="%{$fg[blue]%}⚑"
ZSH_THEME_GIT_PROMPT_CLEAN="%{$fg_bold[green]%}✔"

PROMPT=$'%(?..%F{red}%?%f · )%F{yellow}%B%~%b%F{white}$(gitprompt)\n%D{%H:%M} $ '
RPROMPT=''

function ppgrep() { pgrep "$@" | xargs --no-run-if-empty ps -p; }

## Run interactive `claude` inside tmux. Pipes, hooks, MCP servers and Claude's
## own Bash tool reach the real binary untouched. Herdr cannot inspect nested
## tmux panes, so use the real binary there. Escape hatch: CLAUDE_NO_TMUX=1
if [[ ${HERDR_ENV:-} != 1 ]]; then
  source $DOTFILES_DIR_HOME/claude/tmux-wrapper.zsh
fi

## Badged Chrome clones (own Cmd+Tab icons) + the `chrome-cdp` launcher.
source $DOTFILES_DIR_HOME/chrome/instances.zsh

setopt extended_glob
setopt dotglob
