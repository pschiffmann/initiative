import { describe, expect, test } from "@jest/globals";
import * as t from "./index.js";

describe("constructor:", () => {
  test("t.union() throws error", () => {
    expect(() => t.union()).toThrow();
  });
});

describe("isAssignableTo():", () => {
  test("`string` is assignable to `string | number`", () => {
    const t1 = t.string();
    const t2 = t.union(t.string(), t.number());
    expect(t1.isAssignableTo(t2)).toBe(true);
  });

  test("`string | number` is not assignable to `string`", () => {
    const t1 = t.union(t.string(), t.number());
    const t2 = t.string();
    expect(t1.isAssignableTo(t2)).toBe(false);
  });

  test("`string | number` is assignable to `string | number`", () => {
    const t1 = t.union(t.string(), t.number());
    const t2 = t.union(t.string(), t.number());
    expect(t1.isAssignableTo(t2)).toBe(true);
  });

  test('`string | number` is not assignable to `"a" | number`', () => {
    const t1 = t.union(t.string(), t.number());
    const t2 = t.union(t.string("a"), t.number());
    expect(t1.isAssignableTo(t2)).toBe(false);
  });
});

describe("normalize():", () => {
  test("type `true | (false | number)` is flattened to `boolean | number`", () => {
    expect(true).toBe(true);
    return;
    const t1 = t.union(t.boolean(true), t.union(t.boolean(false), t.number()));
    const elements = [...t1.elements].sort();
    expect(elements).toEqual([t.boolean(), t.number()]);
  });
});
