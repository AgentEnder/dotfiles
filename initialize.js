// Sets up various files in ~/ to extend from these files.

const { readFileSync, writeFileSync } = require("fs");
const { join } = require("path");

function setupBashRc() {
    const pathToExtend = join(
        __dirname.replace(process.env.HOME, "~"),
        ".bashrc"
    );

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
    setupBashRc();
    setupGitConfig();
    setupInputRc();
}

main();
