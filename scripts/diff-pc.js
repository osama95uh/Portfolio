/* eslint-disable */
/** Diffs site-before-pc.png vs site-after-pc.png. */
const fs = require("fs");
const { PNG } = require("pngjs");
const pixelmatch = require("pixelmatch").default;

const before = PNG.sync.read(fs.readFileSync("/tmp/opencode/site-before-pc.png"));
const after = PNG.sync.read(fs.readFileSync("/tmp/opencode/site-after-pc.png"));

if (before.width !== after.width || before.height !== after.height) {
  console.log("SIZE MISMATCH:", before.width, "x", before.height, "vs", after.width, "x", after.height);
  process.exit(0);
}
const diff = new PNG({ width: before.width, height: after.height });
const changed = pixelmatch(before.data, after.data, diff.data, before.width, after.height, { threshold: 0.1 });
const total = before.width * before.height;
console.log(`page: ${before.width}x${before.height}`);
console.log(`changed pixels: ${changed} (${((changed / total) * 100).toFixed(3)}%)`);
fs.writeFileSync("/tmp/opencode/site-diff-pc.png", PNG.sync.write(diff));
console.log("diff image: /tmp/opencode/site-diff-pc.png");
