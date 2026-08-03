import assert from "node:assert/strict";
import test from "node:test";

import { comparePasswords, hashPassword, toPublicUser } from "./passwords";

test("password hashes are salted and verifiable", () => {
  const first = hashPassword("correct-horse-battery-staple");
  const second = hashPassword("correct-horse-battery-staple");

  assert.notEqual(first, second);
  assert.equal(comparePasswords("correct-horse-battery-staple", first), true);
  assert.equal(comparePasswords("wrong-password", first), false);
});

test("malformed password hashes fail closed", () => {
  assert.equal(comparePasswords("anything", ""), false);
  assert.equal(comparePasswords("anything", "not-a-valid-hash"), false);
  assert.equal(comparePasswords("anything", "00.salt.extra"), false);
});

test("public users never expose the password hash", () => {
  const user = { id: 7, username: "traveller", password: "private-hash" };
  const publicUser = toPublicUser(user);

  assert.deepEqual(publicUser, { id: 7, username: "traveller" });
  assert.equal("password" in publicUser, false);
});
