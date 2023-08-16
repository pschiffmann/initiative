import { describe, expect, test } from "@jest/globals";
import { assertTypesAreEqual } from "../util/test-utils.js";
import * as t from "./index.js";

describe("isAssignableTo():", () => {
  test("`string` is assignable to `string`", () => {
    const t1 = t.string();
    const t2 = t.string();
    expect(t1.isAssignableTo(t2)).toBe(true);
  });

  test('`"a"` is assignable to `"a"`', () => {
    const t1 = t.string("a");
    const t2 = t.string("a");
    expect(t1.isAssignableTo(t2)).toBe(true);
  });

  test('`"a"` is not assignable to `"b"`', () => {
    const t1 = t.string("a");
    const t2 = t.string("b");
    expect(t1.isAssignableTo(t2)).toBe(false);
  });

  test('`"a"` is assignable to `string`', () => {
    const t1 = t.string("a");
    const t2 = t.string();
    expect(t1.isAssignableTo(t2)).toBe(true);
  });

  test('`string` is not assignable to `"a"`', () => {
    const t1 = t.string();
    const t2 = t.string("a");
    expect(t1.isAssignableTo(t2)).toBe(false);
  });
});

test("toString() escapes special characters in string literals", () => {
  expect(t.string().toString()).toBe("string");
  expect(t.string("a").toString()).toBe('"a"');
  expect(t.string(`a"b'c\\d`).toString()).toBe(`"a\\"b'c\\\\d"`);
});

describe("Unwrap:", () => {
  test("`t.Unwrap<t.String>` is `string`", () => {
    const t1 = t.string();
    type T1 = t.Unwrap<typeof t1>;
    assertTypesAreEqual<T1, string>(true);
  });

  test('`t.Unwrap<t.String<"a">>` is `"a"`', () => {
    const t1 = t.string("a");
    type T1 = t.Unwrap<typeof t1>;
    assertTypesAreEqual<T1, "a">(true);
  });
});
