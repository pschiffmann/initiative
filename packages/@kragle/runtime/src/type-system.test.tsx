import { expect, test } from "@jest/globals";
import * as t from "./type-system.js";

test("`(p1: 'a' | 'b') => number` is assignable to `(p1: string) => void`", () => {
  const f1 = t.function(t.union(t.string("a"), t.string("b")))(t.number());
  const f2 = t.function(t.string())();
  expect(f1.isAssignableTo(f2 as any)).toBe(true);
  type F1 = t.Unwrap<typeof f1>;
  type F2 = t.Unwrap<typeof f2>;
});
