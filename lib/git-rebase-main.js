// Usage: git rbm
const path = require("path");
const readline = require("readline");
const tryExec = require("./utils/try-exec");
const { stdin } = require("process");

const LOCKFILES = [
  { file: "bun.lock", pm: "bun"},
  { file: "bun.lockb", pm: "bun"},
  { file: "pnpm-lock.yaml", pm: "pnpm", installCommand: "pnpm install --config.confirmModulesPurge=false" },
  { file: "yarn.lock", pm: "yarn" },
  { file: "package-lock.json", pm: "npm" },
];

async function getOriginRemoteName() {
  const { stdout, code } = await tryExec("git remote", true);
  if (code !== 0) {
    throw new Error("Failed to get remote name. \n" + stdout);
  }
  return stdout.includes("upstream") ? "upstream" : "origin";
}

async function getMainBranchName() {
  const { code } = await tryExec("git show-ref --quiet refs/heads/main", true);
  return code === 0 ? "main" : "master";
}

async function localMainIsAheadOfRemote(origin, mainBranchName) {
  const localExists = await tryExec(
    `git show-ref --quiet refs/heads/${mainBranchName}`,
    true
  );
  if (localExists.code !== 0) return false;
  // Exit 0 when origin/main is an ancestor of local main (local is ahead or equal)
  const ancestorCheck = await tryExec(
    `git merge-base --is-ancestor ${origin}/${mainBranchName} ${mainBranchName}`,
    true
  );
  return ancestorCheck.code === 0;
}

async function updateMainBranch(origin, mainBranchName) {
  // Always fetch the remote ref first so we can compare without mutating local main
  const fetchResult = await tryExec(
    `git fetch ${origin} ${mainBranchName}`,
    true
  );
  if (fetchResult.code !== 0) {
    throw new Error("Failed to fetch main branch from remote.");
  }

  // Prefer the local main branch when it already contains the remote tip
  if (await localMainIsAheadOfRemote(origin, mainBranchName)) {
    return { rebaseTarget: mainBranchName };
  }

  // Otherwise fast-forward local main to the remote (no -f: refuse on divergence)
  const ffResult = await tryExec(
    `git fetch ${origin} ${mainBranchName}:${mainBranchName}`,
    true
  );
  if (ffResult.code === 0) {
    return { rebaseTarget: mainBranchName };
  }

  // Falls back to the remote tracking ref (e.g. when main is checked out in
  // another worktree, or when local and remote main have diverged)
  return { rebaseTarget: `${origin}/${mainBranchName}` };
}

async function rebaseThisBranch(rebaseTarget) {
  return tryExec(`git rebase ${rebaseTarget}`);
}

async function findChangedLockfiles() {
  const { stdout, code } = await tryExec(
    "git diff --name-only ORIG_HEAD HEAD",
    true
  );
  if (code !== 0) return [];
  const changed = stdout.split("\n").filter(Boolean);
  // De-dupe by directory + package manager so each install only prompts once
  const seen = new Set();
  const matches = [];
  for (const filePath of changed) {
    const basename = path.basename(filePath);
    const match = LOCKFILES.find((entry) => entry.file === basename);
    if (!match) continue;
    const dir = path.dirname(filePath);
    const key = `${dir}::${match.pm}`;
    if (seen.has(key)) continue;
    seen.add(key);
    matches.push({
      pm: match.pm,
      dir,
      filePath,
      // Entries may override the command (pnpm needs a flag to stop it
      // prompting about purging modules); the rest are just `<pm> install`.
      installCommand: match.installCommand ?? `${match.pm} install`,
    });
  }
  return matches;
}

function promptYesNo(question) {
  if (!stdin.isTTY) {
    console.log(`Skipped prompt for ${question} because the terminal is not a tty.`);
    return false;
  }
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(question, (answer) => {
      rl.close();
      resolve(/^y(es)?$/i.test(answer.trim()));
    });
  });
}

async function maybePromptInstall() {
  const lockfiles = await findChangedLockfiles();
  if (lockfiles.length === 0) return;

  const { stdout: repoRootOut, code: rootCode } = await tryExec(
    "git rev-parse --show-toplevel",
    true
  );
  if (rootCode !== 0) return;
  const repoRoot = repoRootOut.trim();

  for (const { dir, filePath, installCommand } of lockfiles) {
    const yes = await promptYesNo(
      `Rebase brought in changes to ${filePath}. Run \`${installCommand}\`? [y/N] `
    );
    if (!yes) continue;
    const cwd = path.resolve(repoRoot, dir);
    await tryExec(`cd ${JSON.stringify(cwd)} && ${installCommand}`);
  }
}

(async () => {
  const origin = await getOriginRemoteName();
  const branch = await getMainBranchName();
  const { rebaseTarget } = await updateMainBranch(origin, branch);
  const { code: rebaseCode } = await rebaseThisBranch(rebaseTarget);
  if (rebaseCode !== 0) {
    // Surface the rebase's own status. A rebase that stopped on conflicts is
    // not a success, and callers -- `git rbm && ...`, CI, scripts driving this
    // unattended -- have no other way to tell. exitCode rather than exit() so
    // git's already-streamed output flushes normally.
    process.exitCode = rebaseCode;
    return;
  }
  await maybePromptInstall();
})().catch((error) => {
  console.log(error.message);
  process.exit(1);
});
