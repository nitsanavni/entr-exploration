import test from "ava";
import { $, nothrow } from "zx";

test("sanity", async (t) => {
  t.regex(
    (await $`man entr`).stdout,
    /run arbitrary commands when files change/
  );
});
