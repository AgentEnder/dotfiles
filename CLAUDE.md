# dotfiles

`node initialize.js` wires this repo into the machine. It is idempotent, so re-run it whenever a step here says to.

## After editing anything under `skills/`

Re-run `node initialize.js`.

The Claude and Codex installs are symlinks into `skills/`, so an edit there is live at once. Any target in `config.local.json` with mode `copy` is a snapshot, and only a rerun refreshes it. On this machine the copy target is the brain sandbox skills at `~/brain-content/sandbox/skills`. brain ships that directory into every box it provisions, so a skipped rerun sends the old skill into new sandboxes. The rerun prints `Refreshed` for each copy it replaced and `already current` for the rest.

`config.local.json` is machine-local and gitignored. `config.example.json` documents its shape.

## Prose

Docs and skill text follow the `author-prose` skill in `skills/author-prose`, which also names the register for this file.
