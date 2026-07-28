// Usage: git com
// Checks out main (falling back to master). If that branch is already checked
// out in another worktree, walks main-1, main-2, ... reusing an existing
// sibling if it's free, otherwise creating a fresh one that tracks the base.
const tryExec = require("./utils/try-exec");

async function localRefExists(branch) {
  const { code } = await tryExec(
    `git show-ref --quiet refs/heads/${branch}`,
    true
  );
  return code === 0;
}

async function getBaseBranchName() {
  return (await localRefExists("main")) ? "main" : "master";
}

(async () => {
  const base = await getBaseBranchName();

  // Happy path: base branch is free to check out.
  const { code: baseCode } = await tryExec(`git checkout ${base}`, true);
  if (baseCode === 0) {
    process.stdout.write(`Switched to ${base}\n`);
    return;
  }

  // Base is in use (checked out in another worktree). Walk the numbered ladder.
  for (let i = 1; ; i++) {
    const candidate = `${base}-${i}`;

    if (await localRefExists(candidate)) {
      const { code } = await tryExec(`git checkout ${candidate}`, true);
      if (code === 0) {
        process.stdout.write(`Switched to ${candidate}\n`);
        return;
      }
      // Sibling is in use too — keep walking.
      continue;
    }

    // No branch at this slot: create one tracking the base and stop.
    const { code, stdout } = await tryExec(
      `git checkout -b ${candidate} --track ${base}`,
      true
    );
    if (code !== 0) {
      throw new Error(`Failed to create ${candidate}.\n` + stdout);
    }
    process.stdout.write(`Created and switched to ${candidate} (tracking ${base})\n`);
    return;
  }
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
