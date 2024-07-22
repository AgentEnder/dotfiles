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
  return tryExec(`git fetch ${origin} ${mainBranchName}:${mainBranchName} -f`);
}

async function rebaseThisBranch(mainBranchName) {
  return tryExec(`git rebase ${mainBranchName}`);
}

(async () => {
  const origin = await getOriginRemoteName();
  const branch = await getMainBranchName();
  const { code } = await updateMainBranch(origin, branch);
  if (code !== 0) {
    throw new Error("Failed to update main branch.");
  }
  await rebaseThisBranch(branch);
})().catch((error) => {
  console.log(error.message);
  process.exit(1);
});
