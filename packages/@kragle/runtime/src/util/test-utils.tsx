export function assertTypesAreEqual<A, B>(
  expectTypesAreEqual: AreTypesEqual<A, B>
) {}

type AreTypesEqual<A, B> = A extends B ? (B extends A ? true : false) : false;
