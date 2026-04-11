#!/usr/bin/env node

// Usage: copy-env-files <source-dir> <dest-dir>
//
// Recursively copies all files matching *.env* from source-dir to dest-dir,
// preserving the directory structure. Useful for populating new git worktrees
// with environment files that are gitignored.

const { readdirSync, statSync, mkdirSync, copyFileSync } = require("fs");
const { join, relative, dirname } = require("path");

function findEnvFiles(dir, root = dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      if (entry === "node_modules" || entry === ".git") continue;
      results.push(...findEnvFiles(fullPath, root));
    } else if (entry.includes(".env")) {
      results.push(relative(root, fullPath));
    }
  }
  return results;
}

function main() {
  const [sourceDir, destDir] = process.argv.slice(2);

  if (!sourceDir || !destDir) {
    console.error("Usage: copy-env-files <source-dir> <dest-dir>");
    process.exit(1);
  }

  const envFiles = findEnvFiles(sourceDir);

  if (envFiles.length === 0) {
    console.log("No .env files found in", sourceDir);
    return;
  }

  for (const relPath of envFiles) {
    const src = join(sourceDir, relPath);
    const dest = join(destDir, relPath);
    mkdirSync(dirname(dest), { recursive: true });
    copyFileSync(src, dest);
    console.log("  ✓", relPath);
  }

  console.log(`Copied ${envFiles.length} .env file(s) to ${destDir}`);
}

main();
