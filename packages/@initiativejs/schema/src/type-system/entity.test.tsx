import { describe, expect, test } from "@jest/globals";
import { assertTypesAreEqual } from "../util/test-utils.js";
import * as t from "./index.js";

interface Person {
  readonly name: string;
  readonly age: number;
}

const person = t.entity<Person>("@initiativejs/schema/EntityPersonTest", {
  moduleName: "@initiativejs/schema/entities",
  exportName: "Person",
});

describe(`isAssignableTo():`, () => {
  test("`entity` is assignable to itself", () => {
    expect(person().isAssignableTo(person())).toBe(true);
  });
});

describe("Unwrap:", () => {
  test("`Unwrap<t.Entity<Person>>` is `Person`", () => {
    const p1 = person();
    type T1 = t.Unwrap<typeof p1>;
    assertTypesAreEqual<T1, Person>(true);
  });
});
