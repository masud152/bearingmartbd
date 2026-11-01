import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const evidence = await readFile(new URL("../validation/RELEASE_A_4D_CAPTURE_EVIDENCE.sh", import.meta.url), "utf8");
const reset = await readFile(new URL("../validation/RELEASE_A_4D_RESET_BASELINE.sh", import.meta.url), "utf8");

test("evidence capture excludes tablespaces and fails before reporting success", () => {
  assert.match(evidence, /--no-tablespaces/);
  assert.match(evidence, /mysqldump failed; evidence capture is incomplete/);
  assert.match(evidence, /test -s "\$SCHEMA_TMP"/);
  assert.match(evidence, /sha256sum -c SHA256SUMS/);
  assert.ok(evidence.indexOf("sha256sum -c SHA256SUMS") < evidence.indexOf("EVIDENCE_CAPTURED="));
});

test("reset requires verified evidence before its hard-coded disposable-database drop", () => {
  assert.match(reset, /test -s "\$EVIDENCE_DIR\/inspection\.txt"/);
  assert.match(reset, /test -s "\$EVIDENCE_DIR\/schema\.sql"/);
  assert.match(reset, /test -s "\$EVIDENCE_DIR\/SHA256SUMS"/);
  assert.match(reset, /sha256sum -c SHA256SUMS/);
  assert.match(reset, /DROP DATABASE \\`bearingmartbd_release_a_test\\`/);
  assert.ok(reset.indexOf("sha256sum -c SHA256SUMS") < reset.indexOf("DROP DATABASE"));
});
