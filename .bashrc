SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

source $SCRIPT_DIR/git-prompt.sh

PROMPT_COMMAND='PS1_CMD1=$(__git_ps1 " (%s)")'; PS1='\[\e[2m\]\w\[\e[0;3m\]${PS1_CMD1}\[\e[0m\]: '

alias nx='npx nx'

function sourceLocalBashrc() {
  if [ "$PWD" != $SCRIPT_DIR ] && [ "$PWD" != "$HOME" ] && [ -f '.bashrc' ]; then
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

eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

shopt -s extglob
shopt -s dotglob
