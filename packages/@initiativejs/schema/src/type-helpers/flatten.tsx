/**
 * Input:
 * ```ts
 * type Input = {
 *   x: {
 *     a: "abc";
 *     b: "def";
 *   };
 *   y: {
 *     b: "ghi";
 *     c: "jkl";
 *   };
 * }
 * ```
 *
 * Output:
 * ```ts
 * type Output = {
 *   a: "abc";
 *   b: "def" | "ghi";
 *   c: "jkl";
 * }
 * ```
 */
export type Flatten<record extends {}> = {
  readonly [nestedKey in NestedKeys<record>]: NestedValues<record, nestedKey>;
};

/**
 * Input:
 * ```ts
 * type Input = {
 *   x: {
 *     a: "abc";
 *     b: "def";
 *   };
 *   y: {
 *     b: "ghi";
 *     c: "jkl";
 *   };
 * }
 * ```
 *
 * Output:
 * ```ts
 * type Output = "a" | "b" | "c";
 * ```
 */
type NestedKeys<record> = {
  [key in keyof record]: keyof record[key] & string;
}[keyof record];

/**
 * Extracts all values from `record[keyof record][nestedKey]`.
 *
 * Input:
 * ```ts
 * type Input = {
 *   x: {
 *     a: "abc";
 *     b: "def";
 *   };
 *   y: {
 *     b: "ghi";
 *     c: "jkl";
 *   };
 * }
 * ```
 *
 * Output (`nestedKey === "a"`):
 * ```ts
 * type Output = "abc";
 * ```
 *
 * Output (`nestedKey === "b"`):
 * ```ts
 * type Output = "def" | "ghi";
 * ```
 */
type NestedValues<record, nestedKey> = {
  [key in keyof record]: nestedKey extends keyof record[key]
    ? record[key][nestedKey]
    : never;
}[keyof record];
