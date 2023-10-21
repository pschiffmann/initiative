import { describe, expect, test } from "@jest/globals";
import { assertTypesAreEqual } from "../util/test-utils.js";
import * as t from "./index.js";

describe("isAssignableTo():", () => {
  test("`number` is assignable to `number`", () => {
    const t1 = t.number();
    const t2 = t.number();
    expect(t1.isAssignableTo(t2)).toBe(true);
  });

  test("`4` is assignable to `4`", () => {
    const t1 = t.number(4);
    const t2 = t.number(4);
    expect(t1.isAssignableTo(t2)).toBe(true);
  });

  test("`4` is not assignable to `3.14159`", () => {
    const t1 = t.number(4);
    const t2 = t.number(3.14159);
    expect(t1.isAssignableTo(t2)).toBe(false);
  });

  test("`4` is assignable to `number`", () => {
    const t1 = t.number(4);
    const t2 = t.number();
    expect(t1.isAssignableTo(t2)).toBe(true);
  });

  test("`number` is not assignable to `4`", () => {
    const t1 = t.number();
    const t2 = t.number(4);
    expect(t1.isAssignableTo(t2)).toBe(false);
  });
});

describe("Unwrap:", () => {
  test("`Unwrap<t.Number` is `number`", () => {
    const t1 = t.number();
    type T1 = t.Unwrap<typeof t1>;
    assertTypesAreEqual<T1, number>(true);
  });

  test("`Unwrap<t.Number<4>` is `4`", () => {
    const t1 = t.number(4);
    type T1 = t.Unwrap<typeof t1>;
    assertTypesAreEqual<T1, 4>(true);
  });
});
