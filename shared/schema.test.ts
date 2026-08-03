import assert from "node:assert/strict";
import test from "node:test";

import { insertExpenseSchema, insertSuggestionSchema } from "./schema";

test("expense input rejects invalid amounts", () => {
  assert.equal(insertExpenseSchema.safeParse({ concept: "Train", amount: 1200 }).success, true);
  assert.equal(insertExpenseSchema.safeParse({ concept: "Train", amount: 0 }).success, false);
  assert.equal(insertExpenseSchema.safeParse({ concept: "", amount: 1200 }).success, false);
});

test("suggestion links are optional but must be absolute URLs", () => {
  const base = {
    city: "kyoto",
    day: 2,
    period: "morning",
    placeName: "Fushimi Inari",
    description: "Early morning visit",
    order: 1,
  };

  assert.equal(insertSuggestionSchema.safeParse({ ...base, link: "" }).success, true);
  assert.equal(
    insertSuggestionSchema.safeParse({ ...base, link: "https://example.com/place" }).success,
    true,
  );
  assert.equal(insertSuggestionSchema.safeParse({ ...base, link: "javascript:alert(1)" }).success, false);
});
