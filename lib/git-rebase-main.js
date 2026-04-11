// Usage: git rbm
const tryExec = require("./utils/try-exec");

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

async function updateMainBranch(origin, mainBranchName) {
  // Try to update the local main branch directly
  const result = await tryExec(
    `git fetch ${origin} ${mainBranchName}:${mainBranchName} -f`,
    true
  );
  if (result.code === 0) {
    return { rebaseTarget: mainBranchName };
  }
  // Falls back to fetching the remote tracking ref (e.g. when main is
  // checked out in another worktree and can't be updated directly)
  const fallback = await tryExec(
    `git fetch ${origin} ${mainBranchName}`,
    true
  );
  if (fallback.code !== 0) {
    throw new Error("Failed to fetch main branch from remote.");
  }
  return { rebaseTarget: `${origin}/${mainBranchName}` };
}

async function rebaseThisBranch(rebaseTarget) {
  return tryExec(`git rebase ${rebaseTarget}`);
}

(async () => {
  const origin = await getOriginRemoteName();
  const branch = await getMainBranchName();
  const { rebaseTarget } = await updateMainBranch(origin, branch);
  await rebaseThisBranch(rebaseTarget);
})().catch((error) => {
  console.log(error.message);
  process.exit(1);
});
