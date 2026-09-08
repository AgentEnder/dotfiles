// Sets up various files in ~/ to extend from these files.

const {
  readFileSync,
  writeFileSync,
  mkdirSync,
  chmodSync,
  readdirSync,
  existsSync,
  lstatSync,
  rmSync,
  cpSync,
  readlinkSync,
  unlinkSync,
  symlinkSync,
} = require("fs");
const { join, dirname, basename } = require("path");
const { createHash } = require("crypto");
const checkExecutableOnPath = require("./lib/check-executable");

/** Written into a copied skill so a rerun knows the copy is ours to replace. */
const MANAGED_MARKER = ".dotfiles-managed";

const dotfilesDirectory = __dirname.replace(process.env.HOME, "~");

/**
 * Tools these dotfiles lean on. `required` ones make setup meaningless when
 * absent; the rest degrade quietly (the tmux wrapper no-ops without tmux).
 */
const TOOLS = [
  { exe: "zsh", why: "primary shell (.zshrc extensions)", required: true },
  { exe: "git", why: "aliases + .gitconfig include", required: true },
  { exe: "ssh", why: "ssh-config include", required: true },
  { exe: "bash", why: ".bashrc extensions" },
  { exe: "tmux", why: "claude wrapper (claude/tmux-wrapper.zsh)" },
  { exe: "mise", why: "runtime versions (activated in .profile)" },
  { exe: "claude", why: "agent skills (skills/)" },
  { exe: "codex", why: "agent skills (skills/)" },
];

/**
 * Agent hosts that read a directory of skill directories. Everything in
 * `skills/` is linked into each of them, so one copy serves every host.
 *
 * These two are gated on their CLI being installed. Anything else is machine
 * specific and comes from `skillTargets` in `config.local.json`; see
 * `config.example.json`.
 */
const SKILL_HOSTS = [
  { label: "claude", exe: "claude", dir: `${process.env.HOME}/.claude/skills` },
  { label: "codex", exe: "codex", dir: `${process.env.HOME}/.codex/skills` },
];

async function checkTools() {
  const results = await Promise.all(
    TOOLS.map(async (t) => ({ ...t, found: !!(await checkExecutableOnPath(t.exe)) }))
  );
  const missing = results.filter((t) => !t.found);

  if (missing.length === 0) {
    console.log(`✅ Tools check: all ${results.length} present.`);
    return;
  }
  for (const t of missing) {
    const mark = t.required ? "❌" : "⚠️ ";
    console.log(`${mark} Missing \`${t.exe}\` — ${t.why}.`);
  }
}

async function setupBashRc() {
  const pathToExtend = join(dotfilesDirectory, ".bashrc");

  if (!(await checkExecutableOnPath("bash"))) {
    console.log("⚠️ Bash not found in PATH, skipping `.bashrc` setup.");
    return;
  }

  const userBashRc = readFileOrEmpty(`${process.env.HOME}/.bashrc`, "utf8");

  if (!userBashRc.includes(pathToExtend)) {
    writeFileSync(
      `${process.env.HOME}/.bashrc`,
      `${userBashRc}
source ${pathToExtend}\n`
    );
    console.log("✅ Added `.bashrc` extensions to user `.bashrc`.");
  } else {
    console.log("⏩ Skipping `.bashrc`, already setup.");
  }
}

async function setupZshRc() {
  const pathToExtend = join(dotfilesDirectory, ".zshrc");

  if (!(await checkExecutableOnPath("zsh"))) {
    console.log("⚠️ Zsh not found in PATH, skipping `.zshrc` setup.");
    return;
  }

  const userZshRc = readFileOrEmpty(`${process.env.HOME}/.zshrc`, "utf8");

  if (!userZshRc.includes(pathToExtend)) {
    writeFileSync(
      `${process.env.HOME}/.zshrc`,
      `${userZshRc}
source ${pathToExtend}\n`
    );
    console.log("✅ Added `.zshrc` extensions to user `.zshrc`.");
  } else {
    console.log("⏩ Skipping `.zshrc`, already setup.");
  }
}

function setupInputRc() {
  const pathToExtend = join(dotfilesDirectory, ".inputrc");

  const userInputRc = readFileOrEmpty(`${process.env.HOME}/.inputrc`, "utf8");

  if (!userInputRc.includes(pathToExtend)) {
    writeFileSync(
      `${process.env.HOME}/.inputrc`,
      `${userInputRc}

$include ${pathToExtend}\n`
    );
    console.log("✅ Added `.inputrc` extensions to user `.inputrc`.");
  } else {
    console.log("⏩ Skipping `.inputrc`, already setup.");
  }
}

async function setupGitConfig() {
  const pathToExtend = join(dotfilesDirectory, ".gitconfig");

  if (!(await checkExecutableOnPath("git"))) {
    console.log("⚠️ Git not found in PATH, skipping `.gitconfig` setup.");
    return;
  }

  const userGitConfig = readFileOrEmpty(
    `${process.env.HOME}/.gitconfig`,
    "utf8"
  );

  if (!userGitConfig.includes(pathToExtend)) {
    const { decode, encode } = require("./lib/ini");
    const config = decode(userGitConfig);
    if (!config.include) {
      config.include = {
        path: pathToExtend,
      };
    }
    config.core ??= {};
    config.core.excludesfile ??= join(dotfilesDirectory, ".global.gitignore");
    writeFileSync(
      `${process.env.HOME}/.gitconfig`,
      encode(config, {
        whitespace: true,
        align: true,
      }) + "\n"
    );
    console.log("✅ Added `.gitconfig` extensions to user `.gitconfig`.");
  } else {
    console.log("⏩ Skipping `.gitconfig`, already setup.");
  }
}

async function setupSshConfig() {
  const pathToExtend = join(dotfilesDirectory, "ssh-config");
  const includeLine = `Include ${pathToExtend}`;

  if (!(await checkExecutableOnPath("ssh"))) {
    console.log("⚠️ ssh not found in PATH, skipping ssh config setup.");
    return;
  }

  const sshDir = `${process.env.HOME}/.ssh`;
  const sshConfigPath = `${sshDir}/config`;
  mkdirSync(sshDir, { recursive: true, mode: 0o700 });

  const userSshConfig = readFileOrEmpty(sshConfigPath);

  if (userSshConfig.includes(pathToExtend)) {
    console.log("⏩ Skipping ssh config, already setup.");
    return;
  }

  // SSH uses first-match for single-valued options. Prepend so our `Host *`
  // defaults (AddKeysToAgent, UseKeychain, IdentityFile) apply before any
  // existing host-specific blocks override them.
  const trailing = userSshConfig.length === 0 || userSshConfig.endsWith("\n") ? "" : "\n";
  writeFileSync(sshConfigPath, `${includeLine}\n\n${userSshConfig}${trailing}`);
  chmodSync(sshConfigPath, 0o600);
  console.log("✅ Added ssh config extension to ~/.ssh/config.");
}

/** Machine-local settings, absent on a fresh clone. See `config.example.json`. */
function readLocalConfig() {
  const configPath = join(__dirname, "config.local.json");
  if (!existsSync(configPath)) return {};
  try {
    return JSON.parse(readFileSync(configPath, "utf8"));
  } catch (e) {
    console.log(`⚠️ Could not parse config.local.json (${e.message}), ignoring it.`);
    return {};
  }
}

/**
 * Extra skill directories for this machine. brain is the one that matters: it
 * ships the skills it holds into sandbox guests, so it wants `copy` rather than
 * the default `link` (see `copySkill`).
 *
 * `requireParent` because these are hand written paths. A missing parent is a
 * typo or a machine without that tool, and either is worth reporting rather
 * than silently building the tree.
 */
function configuredSkillTargets(config) {
  return (config.skillTargets ?? []).map((target) => ({
    label: target.dir,
    dir: expandHome(target.dir),
    mode: target.mode ?? "link",
    requireParent: true,
  }));
}

/** `~` is shell syntax, and nothing expands it in a value read from a file. */
function expandHome(path) {
  return path.startsWith("~/")
    ? join(process.env.HOME, path.slice(2))
    : path;
}

async function setupSkills(config) {
  // Symlink targets are not shell-expanded, so this one path stays absolute
  // rather than using the `~`-prefixed `dotfilesDirectory`.
  const skillsDirectory = join(__dirname, "skills");
  if (!existsSync(skillsDirectory)) {
    console.log("⏩ Skipping skills, no `skills/` directory.");
    return;
  }

  const skills = readdirSync(skillsDirectory, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();

  if (skills.length === 0) {
    console.log("⏩ Skipping skills, none to link.");
    return;
  }

  for (const host of [...SKILL_HOSTS, ...configuredSkillTargets(config)]) {
    if (host.exe && !(await checkExecutableOnPath(host.exe))) {
      console.log(`⚠️ ${host.exe} not found in PATH, skipping its skill links.`);
      continue;
    }
    if (host.requireParent && !existsSync(dirname(host.dir))) {
      console.log(`⚠️ ${dirname(host.dir)} does not exist, skipping skill links for ${host.label}.`);
      continue;
    }
    mkdirSync(host.dir, { recursive: true });
    for (const skill of skills) {
      const source = join(skillsDirectory, skill);
      const dest = join(host.dir, skill);
      if (host.mode === "copy") copySkill(source, dest, host.label);
      else linkSkill(source, dest, host.label);
    }
  }
}

/**
 * A skill that is already a symlink is ours to repoint: they cost nothing to
 * recreate, and a skill's home moves when one gets ported between repos. A
 * real directory is a skill someone else installed under the same name, so
 * report it and leave it alone rather than deleting their work.
 */
function linkSkill(target, linkPath, host) {
  const name = `\`${basename(target)}\` for ${host}`;
  // lstat, not stat: stat follows the link and reports the target's type, so
  // an existing symlink would look like a directory and never get repointed.
  const existing = lstatSync(linkPath, { throwIfNoEntry: false });

  if (existing?.isSymbolicLink()) {
    const current = readlinkSync(linkPath);
    if (current === target) {
      console.log(`⏩ Skipping skill ${name}, already linked.`);
      return;
    }
    unlinkSync(linkPath);
    symlinkSync(target, linkPath);
    console.log(`🔁 Relinked skill ${name} (was ${current}).`);
    return;
  }

  if (existing) {
    console.log(`⚠️ Skill ${name} is a real directory, not linking over it.`);
    return;
  }

  symlinkSync(target, linkPath);
  console.log(`✅ Linked skill ${name}.`);
}

/**
 * A copy, not a link, for a host that ships the directory somewhere this
 * machine's paths do not reach. brain is the case: its box materializer walks
 * the tree with `lstat`, so a symlinked skill dir takes the symlink branch and
 * is recreated verbatim -- an absolute link into ~/dotfiles that dangles inside
 * a VM or container guest. Real files survive the trip.
 *
 * The marker holds a digest of what was copied, which does two jobs: a rerun
 * that changed nothing stays quiet, and a directory these dotfiles did not put
 * there is never deleted.
 */
function copySkill(source, dest, host) {
  const name = `\`${basename(source)}\` for ${host}`;
  const digest = treeDigest(source);
  const existing = lstatSync(dest, { throwIfNoEntry: false });

  if (existing?.isSymbolicLink()) {
    // Left by a previous `link` run, so ours to replace.
    unlinkSync(dest);
  } else if (existing && !existsSync(join(dest, MANAGED_MARKER))) {
    console.log(`⚠️ Skill ${name} was not copied there by these dotfiles, leaving it alone.`);
    return;
  } else if (existing && readFileOrEmpty(join(dest, MANAGED_MARKER)).trim() === digest) {
    console.log(`⏩ Skipping skill ${name}, copy already current.`);
    return;
  }

  const refreshed = existsSync(dest);
  rmSync(dest, { recursive: true, force: true });
  cpSync(source, dest, { recursive: true });
  writeFileSync(join(dest, MANAGED_MARKER), `${digest}\n`);
  console.log(`${refreshed ? "🔁 Refreshed" : "✅ Copied"} skill ${name}.`);
}

/**
 * Content digest of a skill directory: names and bytes, in a stable order, so
 * it is independent of mtimes and of the order the filesystem hands entries
 * back. The marker itself is excluded or every copy would change its own input.
 */
function treeDigest(dir) {
  const hash = createHash("sha256");
  const walk = (current, prefix) => {
    const entries = readdirSync(current, { withFileTypes: true })
      .filter((e) => e.name !== MANAGED_MARKER)
      .sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      const path = join(current, entry.name);
      hash.update(`${prefix}${entry.name}\0`);
      if (entry.isDirectory()) walk(path, `${prefix}${entry.name}/`);
      else hash.update(readFileSync(path));
    }
  };
  walk(dir, "");
  return hash.digest("hex").slice(0, 16);
}

function readFileOrEmpty(path) {
  try {
    return readFileSync(path, "utf8");
  } catch (e) {
    return "";
  }
}

async function main() {
  await checkTools();
  await setupZshRc();
  await setupBashRc();
  await setupGitConfig();
  setupInputRc();
  await setupSshConfig();
  await setupSkills(readLocalConfig());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
