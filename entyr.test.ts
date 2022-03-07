import test from "ava";
import { $, nothrow } from "zx";

test("sanity", async (t) => {
  t.regex(
    (await $`man entr | head -n 4 | tail -n 1`).stdout,
    /run arbitrary commands when files change/
  );
});
