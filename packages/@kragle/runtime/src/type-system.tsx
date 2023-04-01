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

export abstract class KragleType<T = unknown> {
  /**
   * This property is only used by `Unwrap` for type inference. The value
   * doesn't exist at runtime.
   */
  readonly _output!: T;

  /**
   * Returns `true` if values of this type are assignable to type `other`.
   *
   * For example, `t.literal(4)` is assignable to `t.number`, but `t.number` is
   * not assignable to `t.literal(4)`.
   */
  abstract isAssignableTo(other: KragleType): boolean;
}

//
// Array
//

class KragleArray<T extends KragleType> extends KragleType<
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
}

function kragleArray<T extends KragleType>(element: T): KragleArray<T> {
  return new KragleArray(element);
}

//
// Boolean
//

class KragleBoolean<T extends boolean> extends KragleType<T> {
  constructor(readonly value?: T) {
    super();
  }

  override isAssignableTo(other: KragleType): boolean {
    return false;
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
> extends KragleType<(...args: Unwrap<P>) => Unwrap<R>> {
  constructor(readonly parameters: P, readonly returns: R) {
    super();
  }

  override isAssignableTo(): boolean {
    return false;
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

class KragleNull extends KragleType<null> {
  override isAssignableTo(other: KragleType): boolean {
    return other instanceof KragleNull;
  }
}

const kragleNull = new KragleNull();

//
// Number
//

class KragleNumber<T extends number> extends KragleType<T> {
  constructor(readonly value?: T) {
    super();
  }

  override isAssignableTo(other: KragleType): boolean {
    return false;
  }
}

function kragleNumber<T extends number>(value?: T): KragleNumber<T> {
  return new KragleNumber(value);
}

//
// String
//

class KragleString<T extends string> extends KragleType<T> {
  constructor(readonly value?: T) {
    super();
  }

  override isAssignableTo(other: KragleType): boolean {
    return false;
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
> extends KragleType<UnwrapArray<E>> {
  constructor(readonly elements: E) {
    super();
  }

  override isAssignableTo(other: KragleType): boolean {
    if (other instanceof KragleTuple) {
      const otherElements = other.elements as KragleTypeArray;
      return (
        this.elements.length >= otherElements.length &&
        otherElements.every((element, i) =>
          this.elements[i].isAssignableTo(element)
        )
      );
    }
    return false;
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

class KragleUndefined extends KragleType<undefined> {
  override isAssignableTo(other: KragleType): boolean {
    return other instanceof KragleUndefined;
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

class KragleUnion<T extends KragleTypeArray> extends KragleType<
  Unwrap<T[number]>
> {
  constructor(elements: T) {
    super();
  }

  override isAssignableTo(other: KragleType): boolean {
    return false;
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

class KragleVoid extends KragleType<void> {
  override isAssignableTo(): boolean {
    return true;
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
