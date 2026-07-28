// Sets up various files in ~/ to extend from these files.

const { readFileSync, writeFileSync, mkdirSync, chmodSync } = require("fs");
const { join } = require("path");
const checkExecutableOnPath = require("./lib/check-executable");

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
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
