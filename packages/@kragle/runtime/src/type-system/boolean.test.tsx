import { describe, expect, test } from "@jest/globals";
import { assertTypesAreEqual } from "./_test-utils.js";
import * as t from "./index.js";

describe(`isAssignableTo():`, () => {
  test("`boolean` is assignable to `boolean`", () => {
    const t1 = t.boolean();
    const t2 = t.boolean();
    expect(t1.isAssignableTo(t2)).toBe(true);
  });

  test("`true` is assignable to `boolean`", () => {
    const t1 = t.boolean(true);
    const t2 = t.boolean();
    expect(t1.isAssignableTo(t2)).toBe(true);
  });

  test("`boolean` is not assignable to `true`", () => {
    const t1 = t.boolean();
    const t2 = t.boolean(true);
    expect(t1.isAssignableTo(t2)).toBe(false);
  });

  test("`boolean` is assignable to `true | false`", () => {
    const t1 = t.boolean();
    const t2 = t.union(t.boolean(true), t.boolean(false));
    expect(t1.isAssignableTo(t2)).toBe(true);
  });
});

describe("Unwrap:", () => {
  test("`Unwrap<t.Boolean>` is `boolean`", () => {
    const t1 = t.boolean();
    type T1 = t.Unwrap<typeof t1>;
    assertTypesAreEqual<T1, boolean>(true);
  });

  test("`Unwrap<t.Boolean<false>>` is `false`", () => {
    const t1 = t.boolean(false);
    type T1 = t.Unwrap<typeof t1>;
    assertTypesAreEqual<T1, false>(true);
  });
});
