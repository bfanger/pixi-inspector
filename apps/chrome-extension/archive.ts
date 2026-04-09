import { execSync } from "node:child_process";

const filename = "../../chrome-extension.zip";
if (process.platform === "win32") {
  execSync(
    `powershell -Command "Compress-Archive -Path build\\* -DestinationPath '${filename}'"`,
    { cwd: import.meta.dirname },
  );
} else {
  execSync(`zip -r "${filename}" build/ -x "*.DS_Store"`, {
    cwd: import.meta.dirname,
  });
}
