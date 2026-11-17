// Max 50 lines per hand-written file. README, lockfile and generated files are exempt.
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const MAX = 50;
const EXEMPT = [/^README\.md$/, /^package-lock\.json$/, /^convex\/_generated\//, /^n8n\/workflows\/.*\.json$/];

const files = execSync("git ls-files --cached --others --exclude-standard", { encoding: "utf8" })
  .split("\n")
  .filter((f) => f && existsSync(f) && !EXEMPT.some((re) => re.test(f))); // skip unstaged deletions

const tooLong = files
  .map((f) => ({ f, lines: readFileSync(f, "utf8").replace(/\n$/, "").split("\n").length }))
  .filter(({ lines }) => lines > MAX);

for (const { f, lines } of tooLong) console.error(`${f}: ${lines} lines (max ${MAX})`);
if (tooLong.length) process.exit(1);
console.log(`ok: ${files.length} files, none longer than ${MAX} lines`);
