import * as t from "./index.js";

// TODO: export { Type as Type };
export abstract class Type<T = unknown> {
  /**
   * **Warning:** This property is only used by `Unwrap` for type inference. It
   * doesn't exist at runtime.
   */
  readonly _output!: T;

  /**
   * Returns `true` if `this` is a subtype of `other, i.e. if values of this
   * type are assignable to the other type.
   *
   * ```ts
   * t.string("foo").isAssignableTo(t.string()); // true
   * t.string().isAssignableTo(t.string("foo")); // false
   * ```
   */
  isAssignableTo(other: Type): boolean {
    if (other instanceof t.Any || other instanceof t.Void) {
      return true;
    } else if (t.Union.is(other)) {
      return other.elements.some((element) => this._isAssignableTo(element));
    } else {
      return this._isAssignableTo(other);
    }
  }

  protected abstract _isAssignableTo(other: Type): boolean;

  /**
   * Returns an equivalent copy of `this` where superfluous `Type`
   * elements are removed.
   *
   * For example, `string | "foo"` becomes `string`,
   * `string | (number | boolean)` becomes `string | number | boolean`, and
   * `true | false` becomes `boolean`.
   */
  canonicalize(): Type {
    return this;
  }

  abstract toString(addBrackets?: boolean): string;
}
