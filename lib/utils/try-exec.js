const { exec } = require("child_process");

module.exports = function tryExec(command, silent = false) {
  const childProcess = exec(command);
  return new Promise((resolve, reject) => {
    let stdout = "";
    let stderr = "";

    childProcess.on("exit", (code) => {
      resolve({ code, stdout, stderr });
    });

    childProcess.stdout.on("data", (data) => {
      if (!silent) process.stdout.write(data);
      stdout += data;
    });

    childProcess.stderr.on("data", (data) => {
      if (!silent) process.stderr.write(data);
      stderr += data;
    });
  });
};
