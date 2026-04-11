export DOTFILES_DIR_HOME=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

export PATH="$DOTFILES_DIR_HOME/scripts:$PATH"

source $DOTFILES_DIR_HOME/git-prompt.sh

PROMPT_COMMAND='PS1_CMD1=$(__git_ps1 " (%s)")'; PS1='\[\e[2m\]\w\[\e[0;3m\]${PS1_CMD1}\[\e[0m\]: '

function sourceLocalBashrc() {
  if [ "$PWD" != $DOTFILES_DIR_HOME ] && [ "$PWD" != "$HOME" ] && [ -f '.bashrc' ]; then
    echo "Sourcing local .bashrc";
    source .bashrc
  fi      
}

# Updates `cd` to source local .bashrc if it exists
function cd() {
  builtin cd $@
  sourceLocalBashrc
}


# Source local .bashrc on shell start
sourceLocalBashrc

shopt -s extglob
shopt -s dotglob