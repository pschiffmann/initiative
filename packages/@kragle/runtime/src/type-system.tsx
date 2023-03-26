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
  T extends KragleTypeRecord ? { readonly [k in keyof T]: Unwrap<T[k]> } : {};

export abstract class KragleType<T = unknown> {
  readonly _output!: T;
  abstract isAssignableTo(other: KragleType): boolean;
}

//
// Array
//

class KragleArray<T extends KragleType> extends KragleType<Unwrap<T>> {
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

class KragleBoolean extends KragleType<boolean> {
  override isAssignableTo(other: KragleType): boolean {
    return other instanceof KragleNumber;
  }
}

const kragleBoolean = new KragleBoolean();

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

class KragleNumber extends KragleType<number> {
  override isAssignableTo(other: KragleType): boolean {
    return other instanceof KragleNumber;
  }
}

const kragleNumber = new KragleNumber();

//
// String
//

class KragleString extends KragleType<string> {
  override isAssignableTo(other: KragleType): boolean {
    return other instanceof KragleString;
  }
}

const kragleString = new KragleString();

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
  KragleVoid as Void,
  kragleVoid as void,
};
