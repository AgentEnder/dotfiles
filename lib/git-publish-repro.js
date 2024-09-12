const REMOTE_URL = "https://github.com/agentender/github-issues";

const tryExec = require("./utils/try-exec");

function prompt(message) {
    return new Promise((resolve) => {
        const readline = require("readline").createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        readline.question(message, (answer) => {
            readline.close();
            resolve(answer);
        });
        readline.on("SIGINT", () => {
            readline.close();
            process.stdout.write("\n");
            console.log("Aborted.");
            process.exit(1);
        });
    });
}

function isForced() {
    return process.argv.includes("--force") || process.argv.includes("-f");
}

async function checkIfBranchAlreadyOnRemote(branch) {
    const { code } = await tryExec(
        `git ls-remote --exit-code ${REMOTE_URL} ${branch}`,
        true
    );
    return code === 0;
}

(async () => {
    const forced = isForced();
    const currentBranchName = (
        await tryExec("git rev-parse --abbrev-ref HEAD", true)
    ).stdout.trim();
    let branch = currentBranchName;
    if (currentBranchName === "master" || currentBranchName === "main") {
        branch = await prompt(
            `What branch would you like to publish to?${
                forced ? " (Any existing contents will be overwritten)" : ""
            }`
        );
    }
    while (!forced && (await checkIfBranchAlreadyOnRemote(branch))) {
        const next = await prompt(
            `Branch ${branch} already exists on remote. What branch would you like to publish to?`
        );
        if (next === "") {
            console.log("Aborted.");
            process.exit(1);
        }
        if (branch) branch = next;
    }
    await tryExec(`git push ${REMOTE_URL} ${currentBranchName}:${branch}`);
    console.log(`✅ Published branch at ${REMOTE_URL}/tree/${branch}`);
})();
