const path = require("path");
const fs = require("fs/promises");

/**
 * @param {string} exe executable name (without extension if on Windows)
 * @return {Promise<string|null>} executable path if found
 * */
async function checkExecutableOnPath(exe) {
    const envPath = process.env.PATH || "";
    const envExt = process.env.PATHEXT || "";
    const pathDirs = envPath
        .replace(/["]+/g, "")
        .split(path.delimiter)
        .filter(Boolean);
    const extensions = envExt.split(";");
    const candidates = pathDirs.flatMap((d) =>
        extensions.map((ext) => path.join(d, exe + ext))
    );
    try {
        return !!(await Promise.any(candidates.map(checkFileExists)));
    } catch (e) {
        return null;
    }

    async function checkFileExists(filePath) {
        if ((await fs.stat(filePath)).isFile()) {
            return filePath;
        }
        throw new Error("Not a file");
    }
}
module.exports = checkExecutableOnPath;

if (require.main === module) {
    (async () => {
        const exe = process.argv[2];
        if (!exe) {
            console.error("Usage: check-executable <exe>");
            process.exit(1);
        }
        const found = await checkExecutableOnPath(exe);
        console.log(found || "Not found");
    })();
}