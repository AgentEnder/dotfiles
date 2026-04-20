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

(async () => {
  const origin = await getOriginRemoteName();
  const branch = await getMainBranchName();
  const { rebaseTarget } = await updateMainBranch(origin, branch);
  await rebaseThisBranch(rebaseTarget);
})().catch((error) => {
  console.log(error.message);
  process.exit(1);
});
