import { describe, expect, test } from "@jest/globals";
import { assertTypesAreEqual } from "./_test-utils.js";
import * as t from "./index.js";

describe(`isAssignableTo():`, () => {
  test("`(p1: string, p2: number) => number` is assignable to `(p1: string, p2: number) => number`", () => {
    const t1 = t.function(t.string(), t.number())(t.number());
    const t2 = t.function(t.string(), t.number())(t.number());
    expect(t1.isAssignableTo(t2)).toBe(true);
  });

  test("`(p1: string) => number` is assignable to `(p1: string) => void`", () => {
    const t1 = t.function(t.string())(t.number());
    const t2 = t.function(t.string())();
    expect(t1.isAssignableTo(t2)).toBe(true);
  });

  test("`(p1: string) => void` is not assignable to `(p1: string) => undefined`", () => {
    const t1 = t.function(t.string())();
    const t2 = t.function(t.string())(t.undefined());
    expect(t1.isAssignableTo(t2)).toBe(false);
  });

  test("`() => string` is assignable to `() => string | number`", () => {
    const t1 = t.function()(t.string());
    const t2 = t.function()(t.union(t.string(), t.number()));
    expect(t1.isAssignableTo(t2)).toBe(true);
  });

  test("`() => string | number` is not assignable to `() => string`", () => {
    const t1 = t.function()(t.union(t.string(), t.number()));
    const t2 = t.function()(t.string());
    expect(t1.isAssignableTo(t2)).toBe(false);
  });

  test('`(p1: string) => void` is assignable to `(p1: "a") => void`', () => {
    const t1 = t.function(t.string())();
    const t2 = t.function(t.string("a"))();
    expect(t1.isAssignableTo(t2)).toBe(true);
  });

  test('`(p1: "a") => void` is not assignable to `(p1: string) => void`', () => {
    const t1 = t.function(t.string("a"))();
    const t2 = t.function(t.string())();
    expect(t1.isAssignableTo(t2)).toBe(false);
  });

  test("`(p1: string) => void` is assignable to `(p1: string, p2: number) => void`", () => {
    const t1 = t.function(t.string())();
    const t2 = t.function(t.string(), t.number())();
    expect(t1.isAssignableTo(t2)).toBe(true);
  });

  test("`(p1: string, p2: number) => void` is not assignable to `(p1: string) => void`", () => {
    const t1 = t.function(t.string(), t.number())();
    const t2 = t.function(t.string())();
    expect(t1.isAssignableTo(t2)).toBe(false);
  });

  test("`(p1: string, p2?: number) => void` is assignable to `(p1: string) => void`", () => {
    const t1 = t.function(t.string(), t.optional(t.number()))();
    const t2 = t.function(t.string())();
    expect(t1.isAssignableTo(t2)).toBe(true);
  });
});

describe("Unwrap:", () => {
  test("`Unwrap<t.Function<[], t.Void>>` is `() => void`", () => {
    const t1 = t.function()();
    type T1 = t.Unwrap<typeof t1>;
    assertTypesAreEqual<T1, () => void>(true);
  });

  test("`Unwrap<t.Function<[t.Union<[t.String, t.Number]>], t.Boolean>>` is `(p1: string | number) => boolean`", () => {
    const t1 = t.function(t.union(t.string(), t.number()))(t.boolean());
    type T1 = t.Unwrap<typeof t1>;
    assertTypesAreEqual<T1, (p1: string | number) => boolean>(true);
  });
});
