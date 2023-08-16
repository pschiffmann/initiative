import { describe, expect, test } from "@jest/globals";
import { assertTypesAreEqual } from "../util/test-utils.js";
import * as t from "./index.js";

describe(`isAssignableTo():`, () => {
  test("`entity` is assignable to itself", () => {
    const t1 = t.entity("@initiativejs/schema/EntityPersonTest");
    expect(t1.isAssignableTo(t1)).toBe(true);
  });

  test("`entity` is not assignable to other entity with same name", () => {
    const t1 = t.entity("@initiativejs/schema/EntityPersonTest");
    const t2 = t.entity("@initiativejs/schema/EntityPersonTest");
    expect(t1.isAssignableTo(t2)).toBe(false);
  });
});

describe("Unwrap:", () => {
  test("`Unwrap<t.Entity<Person>>` is `Person`", () => {
    interface Person {
      readonly name: string;
      readonly age: number;
    }

    const t1 = t.entity<Person>("@initiativejs/schema/EntityPersonTest");
    type T1 = t.Unwrap<typeof t1>;
    assertTypesAreEqual<T1, Person>(true);
  });
});
