// Usage: git amend [undo]
const tryExec = require("./utils/try-exec");

async function getBranchesPointingAtHead() {
  const { stdout, code } = await tryExec("git branch --points-at HEAD", true);
  if (code !== 0) {
    throw new Error("Failed to get branches pointing at HEAD. \n" + stdout);
  }
  return stdout.split("\n").filter(Boolean);
}

(async () => {
  const branches = await getBranchesPointingAtHead();
  if (branches.length !== 1) {
    console.log(
      "Current commit is relied on by other branches, avoid amending it."
    );
    process.exit(1);
  }
  if (process.argv[2] === "undo") {
    await tryExec("git reset --soft HEAD@{1}");
  } else {
    await tryExec("git commit --amend --no-edit");
  }
})();
