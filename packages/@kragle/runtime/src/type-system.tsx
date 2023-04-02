//
// KragleType base class
//

export type Unwrap<T extends KragleType> = T["_output"];
export type KragleTypeArray = readonly KragleType[];
export type UnwrapArray<T extends KragleTypeArray> = {
  readonly [k in keyof T]: Unwrap<T[k]>;
};
export type KragleTypeRecord = Readonly<Record<string, KragleType>>;
export type UnwrapRecord<T extends KragleTypeRecord | undefined> =
  T extends KragleTypeRecord
    ? MakeUndefinedOptional<{ readonly [k in keyof T]: Unwrap<T[k]> }>
    : {};

type RequiredKeys<T extends {}> = {
  [k in keyof T]: undefined extends T[k] ? never : k;
}[keyof T];
type MakeUndefinedOptional<T extends {}> = Pick<T, RequiredKeys<T>> &
  Partial<T>;

export type KragleType =
  | KragleArray
  | KragleBoolean
  | KragleFunction
  | KragleNull
  | KragleNumber
  | KragleString
  | KragleTuple
  | KragleUndefined
  | KragleUnion
  | KragleVoid;

export abstract class KragleTypeBase<T = unknown> {
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
  abstract isAssignableTo(other: KragleType): boolean;

  /**
   * Returns `true` if `value` is assignable to this type.
   *
   * ```ts
   * t.string().acceptsValue("hello world"); // -> true
   * t.number().acceptsValue("4"); // -> false
   * ```
   */
  acceptsValue(value: unknown): boolean {
    throw new Error("Unimplemented");
  }

  abstract toString(addBrackets?: boolean): string;
}

//
// Array
//

class KragleArray<T extends KragleType = KragleType> extends KragleTypeBase<
  readonly Unwrap<T>[]
> {
  constructor(readonly element: T) {
    super();
  }

  override isAssignableTo(other: KragleType): boolean {
    return (
      other instanceof KragleArray && this.element.isAssignableTo(other.element)
    );
  }

  override toString(): string {
    return `${this.element.toString(true)}[]`;
  }
}

function kragleArray<T extends KragleType>(element: T): KragleArray<T> {
  return new KragleArray(element);
}

//
// Boolean
//

class KragleBoolean<T extends boolean = boolean> extends KragleTypeBase<T> {
  constructor(readonly value?: T) {
    super();
  }

  override isAssignableTo(other: KragleType): boolean {
    if (other instanceof KragleBoolean) {
      return other.value === undefined || this.value === other.value;
    }
    if (other instanceof KragleUnion) {
      if (this.value !== undefined) {
        return other.elements.some((element) => this.isAssignableTo(element));
      } else {
        // Special case: `boolean` contains a finite number of elements.
        // We can check every single value.
        return kragleUnion(
          kragleBoolean(true),
          kragleBoolean(false)
        ).isAssignableTo(other);
      }
    }
    return false;
  }

  override toString(): string {
    return this.value === undefined ? "boolean" : `${this.value}`;
  }
}

function kragleBoolean<T extends boolean>(value?: T): KragleBoolean<T> {
  return new KragleBoolean(value);
}

//
// Function
//

class KragleFunction<
  P extends KragleTuple = KragleTuple,
  R extends KragleType = KragleType
> extends KragleTypeBase<(...args: Unwrap<P>) => Unwrap<R>> {
  constructor(readonly parameters: P, readonly returns: R) {
    super();
  }

  override isAssignableTo(other: KragleType): boolean {
    if (!(other instanceof KragleFunction)) return false;
    return (
      this.parameters.elements.length <= other.parameters.elements.length &&
      other.parameters.elements.every((param, i) =>
        param.isAssignableTo(this.parameters.elements[i])
      ) &&
      this.returns.isAssignableTo(other.returns)
    );
  }

  override toString(addBrackets?: boolean): string {
    const params = this.parameters.elements
      .map((param, i) => `p${i + 1}: ${param}`)
      .join(", ");
    return addBrackets
      ? `((${params}) => ${this.returns})`
      : `(${params}) => ${this.returns}`;
  }
}

interface KragleFunctionFactory<P extends KragleTuple> {
  (): KragleFunction<P, KragleVoid>;
  <R extends KragleType>(returnType: R): KragleFunction<P, R>;
}

function kragleFunction<P extends KragleTypeArray>(
  ...args: P
): KragleFunctionFactory<KragleTuple<P>> {
  return function kragleFunctionFactory(returnType = kragleVoid) {
    return new KragleFunction(new KragleTuple(args), returnType);
  };
}

//
// Null
//

class KragleNull extends KragleTypeBase<null> {
  override isAssignableTo(other: KragleType): boolean {
    return (
      other instanceof KragleNull ||
      (other instanceof KragleUnion &&
        (other as KragleUnion).elements.some((element) =>
          this.isAssignableTo(element)
        ))
    );
  }

  override toString(): string {
    return "null";
  }
}

const kragleNull = new KragleNull();

//
// Number
//

class KragleNumber<T extends number = number> extends KragleTypeBase<T> {
  constructor(readonly value?: T) {
    super();
  }

  override isAssignableTo(other: KragleType): boolean {
    if (other instanceof KragleNumber) {
      return other.value === undefined || this.value === other.value;
    }
    if (other instanceof KragleUnion) {
      return other.elements.some((element) => this.isAssignableTo(element));
    }
    return false;
  }

  override toString(): string {
    return this.value === undefined ? "number" : `${this.value}`;
  }
}

function kragleNumber<T extends number>(value?: T): KragleNumber<T> {
  return new KragleNumber(value);
}

//
// String
//

class KragleString<T extends string = string> extends KragleTypeBase<T> {
  constructor(readonly value?: T) {
    super();
  }

  override isAssignableTo(other: KragleType): boolean {
    return false;
  }

  override toString(): string {
    return this.value === undefined
      ? "string"
      : `"${this.value.replaceAll(/["\\]/g, (m) => `\\${m}`)}"`;
  }
}

function kragleString<T extends string>(value?: T): KragleString<T> {
  return new KragleString(value);
}
//
// Tuple
//

class KragleTuple<
  E extends KragleTypeArray = KragleTypeArray
> extends KragleTypeBase<UnwrapArray<E>> {
  constructor(readonly elements: E) {
    super();
  }

  override isAssignableTo(other: KragleType): boolean {
    if (other instanceof KragleTuple) {
      return (
        this.elements.length >= other.elements.length &&
        other.elements.every((element, i) =>
          this.elements[i].isAssignableTo(element)
        )
      );
    }
    return false;
  }

  override toString(): string {
    return `[${this.elements.join(", ")}]`;
  }
}

function kragleTuple<E extends KragleTypeArray>(
  ...elements: E
): KragleTuple<E> {
  return new KragleTuple(elements);
}

//
// Undefined
//

class KragleUndefined extends KragleTypeBase<undefined> {
  override isAssignableTo(other: KragleType): boolean {
    return other instanceof KragleUndefined;
  }

  override toString(): string {
    return "undefined";
  }
}

const kragleUndefined = new KragleUndefined();

function kragleOptional<T extends KragleType>(
  type: T
): KragleUnion<readonly [T, KragleUndefined]> {
  return new KragleUnion([type, kragleUndefined]);
}

//
// Union
//

class KragleUnion<
  T extends KragleTypeArray = KragleTypeArray
> extends KragleTypeBase<Unwrap<T[number]>> {
  constructor(readonly elements: T) {
    super();
  }

  override isAssignableTo(other: KragleType): boolean {
    return false;
  }

  override toString(addBrackets?: boolean): string {
    const result = this.elements
      .map((element) => element.toString(true))
      .join(" | ");
    return addBrackets ? `(${result})` : result;
  }
}

function kragleUnion<T extends KragleTypeArray>(
  ...elements: T
): KragleUnion<T> {
  return new KragleUnion<T>(elements);
}

//
// Void
//

class KragleVoid extends KragleTypeBase<void> {
  override isAssignableTo(): boolean {
    return true;
  }

  override toString(): string {
    return "void";
  }
}

const kragleVoid = new KragleVoid();

export {
  KragleArray as Array,
  kragleArray as array,
  KragleBoolean as Boolean,
  kragleBoolean as boolean,
  KragleFunction as Function,
  kragleFunction as function,
  KragleNull as Null,
  kragleNull as null,
  KragleNumber as Number,
  kragleNumber as number,
  KragleString as String,
  kragleString as string,
  KragleTuple as Tuple,
  kragleTuple as tuple,
  KragleUndefined as Undefined,
  kragleUndefined as undefined,
  kragleOptional as optional,
  KragleUnion as Union,
  kragleUnion as union,
  KragleVoid as Void,
  kragleVoid as void,
};
