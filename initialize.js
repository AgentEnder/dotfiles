// Sets up various files in ~/ to extend from these files.

const { readFileSync, writeFileSync } = require("fs");
const { join } = require("path");
const checkExecutableOnPath = require("./lib/check-executable");

function setupBashRc() {
    const pathToExtend = join(
        __dirname.replace(process.env.HOME, "~"),
        ".bashrc"
    );

    if (!checkExecutableOnPath("bash")) {
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

function setupZshRc() {
    const pathToExtend = join(
        __dirname.replace(process.env.HOME, "~"),
        ".zshrc"
    );

    if (!checkExecutableOnPath("zsh")) {
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
    const pathToExtend = join(
        __dirname.replace(process.env.HOME, "~"),
        ".inputrc"
    );

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

function setupGitConfig() {
    const pathToExtend = join(
        __dirname.replace(process.env.HOME, "~"),
        ".gitconfig"
    );

    if (!checkExecutableOnPath("git")) {
        console.log("⚠️ Git not found in PATH, skipping `.gitconfig` setup.");
        return;
    }

    const userGitConfig = readFileOrEmpty(
        `${process.env.HOME}/.gitconfig`,
        "utf8"
    );

    if (!userGitConfig.includes(pathToExtend)) {
        writeFileSync(
            `${process.env.HOME}/.gitconfig`,
            `${userGitConfig}
[include]
    path = ${pathToExtend}\n`
        );
        console.log("✅ Added `.gitconfig` extensions to user `.gitconfig`.");
    } else {
        console.log("⏩ Skipping `.gitconfig`, already setup.");
    }
}

function readFileOrEmpty(path) {
    try {
        return readFileSync(path, "utf8");
    } catch (e) {
        return "";
    }
}

function main() {
    setupZshRc();
    setupBashRc();
    setupGitConfig();
    setupInputRc();
}

main();
