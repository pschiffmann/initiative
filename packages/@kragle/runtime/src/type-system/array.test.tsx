import { describe, expect, test } from "@jest/globals";
import { assertTypesAreEqual } from "./_test-utils.js";
import * as t from "./index.js";

describe("isAssignableTo():", () => {
  test("`number[]` is assignable to `number[]`", () => {
    const t1 = t.array(t.number());
    const t2 = t.array(t.number());
    expect(t1.isAssignableTo(t2)).toBe(true);
  });

  test("`4[]` is assignable to `number[]`", () => {
    const t1 = t.array(t.number(4));
    const t2 = t.array(t.number());
    expect(t1.isAssignableTo(t2)).toBe(true);
  });

  test("`number[]` is not assignable to `4[]`", () => {
    const t1 = t.array(t.number());
    const t2 = t.array(t.number(4));
    expect(t1.isAssignableTo(t2)).toBe(false);
  });
});

describe("Unwrap:", () => {
  test("`Unwrap<t.Array<t.String>>` is `string[]`", () => {
    const t1 = t.array(t.string());
    type T1 = t.Unwrap<typeof t1>;
    assertTypesAreEqual<T1, readonly string[]>(true);
  });
});
