import { describe, expect, test } from "@jest/globals";
import { assertTypesAreEqual } from "./_test-utils.js";
import * as t from "./index.js";

describe("constructor:", () => {
  test("t.tuple() throws error", () => {
    expect(() => t.tuple()).toThrow();
  });
});

describe("isAssignableTo():", () => {
  test("`[string, number]` is assignable to `[string, number]`", () => {
    const t1 = t.tuple(t.string(), t.number());
    const t2 = t.tuple(t.string(), t.number());
    expect(t1.isAssignableTo(t2)).toBe(true);
  });

  test('`["a", 4]` is assignable to `[string, number]`', () => {
    const t1 = t.tuple(t.string("a"), t.number(4));
    const t2 = t.tuple(t.string(), t.number());
    expect(t1.isAssignableTo(t2)).toBe(true);
  });

  test('`[string, number]` is not assignable to `["a", 4]`', () => {
    const t1 = t.tuple(t.string(), t.number());
    const t2 = t.tuple(t.string("a"), t.number(4));
    expect(t1.isAssignableTo(t2)).toBe(false);
  });

  test("`[string]` is not assignable to `[string, number]`", () => {
    const t1 = t.tuple(t.string());
    const t2 = t.tuple(t.string(), t.number());
    expect(t1.isAssignableTo(t2)).toBe(false);
  });

  test("`[string, number]` is not assignable to `[string]`", () => {
    const t1 = t.tuple(t.string(), t.number());
    const t2 = t.tuple(t.string());
    expect(t1.isAssignableTo(t2)).toBe(false);
  });

  test("`[string, string]` is assignable to `string[]`", () => {
    const t1 = t.tuple(t.string(), t.string());
    const t2 = t.array(t.string());
    expect(t1.isAssignableTo(t2)).toBe(true);
  });

  test("`[string, number]` is not assignable to `string[]`", () => {
    const t1 = t.tuple(t.string(), t.number());
    const t2 = t.array(t.string());
    expect(t1.isAssignableTo(t2)).toBe(false);
  });
});

describe("Unwrap:", () => {
  test("`t.Unwrap<t.Tuple<[t.String, t.Number]>>` is `[string, number]`", () => {
    const t1 = t.tuple(t.string(), t.number());
    type T1 = t.Unwrap<typeof t1>;
    assertTypesAreEqual<T1, readonly [string, number]>(true);
  });
});
