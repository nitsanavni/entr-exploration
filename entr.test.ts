import test from "ava";
import _ from "lodash";
import { $, nothrow, sleep } from "zx";

test("watches for changes in directory", async (t) => {
  const tempDir: string = _.trim((await $`mktemp -d`).stdout);
  const file = `${tempDir}/file`;
  const watcher = $`echo ${tempDir} | entr -d ls ${tempDir}`;

  let lastOutput = "";
  watcher.stdout.on("data", (d) => (lastOutput = String(d)));

  sleep(100);

  t.deepEqual(lastOutput, "");
});

test("watches for changes - files", async (t) => {
  const tempDir: string = _.trim((await $`mktemp -d`).stdout);
  const file = `${tempDir}/file`;
  await $`touch ${file}`;
  const watcher = $`ls ${file} | entr cat ${file}`;

  let lastOutput = "";
  watcher.stdout.on("data", (d) => (lastOutput = String(d)));

  t.deepEqual(lastOutput, "");

  await sleep(100);

  t.deepEqual(lastOutput, "");

  await $`echo line1 >> ${file}`;
  await sleep(100);

  t.deepEqual(lastOutput, "line1\n");

  await $`echo line2 >> ${file}`;
  await sleep(100);

  t.deepEqual(lastOutput, "line1\nline2\n");

  await $`echo replaced-line > ${file}`;
  await sleep(100);

  t.deepEqual(lastOutput, "replaced-line\n");

  await watcher.kill();
});

test("sanity", async (t) => {
  t.regex(
    (await $`man entr | head -n 4 | tail -n 1`).stdout,
    /run arbitrary commands when files change/
  );
});
