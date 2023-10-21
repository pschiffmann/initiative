import { ObjectMap } from "@pschiffmann/std/object-map";
import * as t from "./index.js";

export abstract class Type<T = unknown> {
  constructor(members: MembersFactory<T> = null) {
    this.#members = members;
  }

  /**
   * **Warning:** This property is only used by `Unwrap` for type inference. It
   * doesn't exist at runtime.
   */
  readonly _output!: T;

  #members: MembersFactory<T>;
  #properties: ObjectMap<Member> = {};
  #methods: ObjectMap<Member> = {};

  #initializeMembers() {
    if (!this.#members) return;
    const { properties, methods } = this.#members();
    this.#members = null;
    if (properties) this.#properties = properties as any;
    if (methods) this.#methods = methods as any;
  }

  get properties(): ObjectMap<Member> {
    this.#initializeMembers();
    return this.#properties;
  }

  get methods(): ObjectMap<Member> {
    this.#initializeMembers();
    return this.#methods;
  }

  /**
   * Returns `true` if `this` is a subtype of `other`, i.e. if values of this
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
      return other.elements.some((element) => this.isAssignableTo(element));
    } else {
      return this._isAssignableTo(other);
    }
  }

  protected abstract _isAssignableTo(other: Type): boolean;

  compareTo(other: Type): number {
    const typeComparison =
      getTypeSortValue(this.constructor) - getTypeSortValue(other.constructor);
    return typeComparison !== 0
      ? typeComparison
      : this._compareTo(other as any);
  }

  protected _compareTo(other: this): number {
    return 0;
  }

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

export function getTypeSortValue(type: unknown): number {
  switch (type) {
    // Deliberate sorting of types inside a union
    case t.Any:
      return 1;
    case t.String:
      return 2;
    case t.Number:
      return 3;
    case t.Boolean:
      return 4;
    case t.Entity:
      return 5;
    case t.Array:
      return 6;
    case t.Function:
      return 7;
    case t.Null:
      return 8;
    case t.Undefined:
      return 9;

    // Types that are unlikely to appear in a union, sorted alphabetically
    case t.Tuple:
      return 10;
    case t.Union:
      return 11;
    case t.Void:
      return 12;
    default:
      throw new Error(`Invalid type '${type}'.`);
  }
}

export type MembersFactory<T> = (() => Members<T>) | null;

export interface Member<T = unknown> {
  readonly doc?: string;
  readonly type: Type<T>;
}

export type Members<T> = {
  readonly properties?: {
    readonly [name in keyof T & string]?: Member<T[name]>;
  };
  readonly methods?: {
    readonly [name in ExtractMethodNames<T>]?: Member<T[name]>;
  };
};

type ExtractMethodNames<T> = {
  [name in keyof T & string]: T[name] extends Function ? name : never;
}[keyof T & string];
