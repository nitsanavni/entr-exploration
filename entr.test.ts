import test from "ava";
import _ from "lodash";
import { $, nothrow, sleep } from "zx";

test("watches for changes in directory", async (t) => {
  const dir: string = _.trim((await $`mktemp -d`).stdout);
  const logger: string = _.trim((await $`mktemp`).stdout);
  const logger2: string = _.trim((await $`mktemp`).stdout);
  const log = async () => (await $`cat ${logger}`).stdout;

  await $`touch ${dir}/file1`;

  const watcher = $`while sleep 0.01; do find ${dir} | entr -dz -s 'sleep .01 && ls ${dir} > ${logger} && cp ${dir}/file1 ${logger2}'; done`;
  // const watcher = $`while sleep 0.01; do find ${dir} | entr -d echo hello; done`;

  await sleep(40);

  t.deepEqual(await log(), `file1\n`);

  await $`touch ${dir}/file2`;
  await sleep(40);

  t.deepEqual(await log(), `file1\nfile2\n`);

  await $`touch ${dir}/file3`;
  await sleep(40);

  t.deepEqual(await log(), `file1\nfile2\nfile3\n`);

  await $`echo line1 >> ${dir}/file1`;
  await sleep(40);

  t.deepEqual((await $`cat ${logger2}`).stdout, `line1\n`);

  await watcher.kill();
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
