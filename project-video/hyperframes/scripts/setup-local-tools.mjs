import fs from "node:fs";
import path from "node:path";
import ffmpegPath from "ffmpeg-static";
import ffprobe from "ffprobe-static";

const projectRoot = process.cwd();
const binDir = path.join(projectRoot, "bin");
fs.mkdirSync(binDir, { recursive: true });

const ffprobePath = typeof ffprobe === "string" ? ffprobe : ffprobe.path;

const shims = [
  ["ffmpeg.cmd", ffmpegPath],
  ["ffprobe.cmd", ffprobePath],
];

for (const [name, target] of shims) {
  if (!target) {
    throw new Error(`Unable to resolve ${name} target`);
  }

  const contents = `@echo off\r\n"${target}" %*\r\n`;
  fs.writeFileSync(path.join(binDir, name), contents);
}

const binaries = [
  ["ffmpeg.exe", ffmpegPath],
  ["ffprobe.exe", ffprobePath],
];

for (const [name, target] of binaries) {
  if (process.platform !== "win32") {
    continue;
  }

  const destination = path.join(binDir, name);
  if (!fs.existsSync(destination)) {
    fs.copyFileSync(target, destination);
  }
}

console.log(`Local FFmpeg shims written to ${binDir}`);
