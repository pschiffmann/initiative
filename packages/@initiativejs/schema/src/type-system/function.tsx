import * as t from "./index.js";
import { intern } from "./interning.js";
import { Type } from "./type.js";

class InitiativeFunction<
  RequiredParameters extends unknown[] = unknown[],
  OptionalParameters extends unknown[] = unknown[],
  ReturnType = unknown,
> extends Type<
  (
    ...args: [...RequiredParameters, ...MakeOptional<OptionalParameters>]
  ) => ReturnType
> {
  constructor(
    requiredParameters: WrapArray<RequiredParameters>,
    optionalParameters: WrapArray<OptionalParameters>,
    readonly returnType: Type<ReturnType>,
  ) {
    super();
    this.parameters = [...requiredParameters, ...optionalParameters];
    this.requiredCount = requiredParameters.length;
  }

  readonly parameters: readonly [
    ...WrapArray<RequiredParameters>,
    ...WrapArray<OptionalParameters>,
  ];

  readonly requiredCount: number;

  protected override _isAssignableTo(other: Type): boolean {
    if (!InitiativeFunction.is(other)) return false;
    if (!this.returnType.isAssignableTo(other.returnType)) return false;
    if (this.requiredCount > other.requiredCount) return false;

    for (let i = 0; i < this.parameters.length; i++) {
      const thisParam =
        i < this.requiredCount
          ? this.parameters[i]
          : t.optional(this.parameters[i]);
      const otherParam =
        i < other.requiredCount
          ? other.parameters[i]
          : t.optional(other.parameters[i]);
      if (!otherParam.isAssignableTo(thisParam)) return false;
    }

    return true;
  }

  protected _compareTo(other: this): number {
    if (this.parameters.length !== other.parameters.length) {
      return this.parameters.length - other.parameters.length;
    }
    for (let i = 0; i < this.parameters.length; i++) {
      const comparison = this.parameters[i].compareTo(other.parameters[i]);
      if (comparison !== 0) return comparison;
    }
    return this.returnType.compareTo(other.returnType);
  }

  override canonicalize(): t.Type {
    return new InitiativeFunction(
      this.parameters.slice(0, this.requiredCount).map((p) => p.canonicalize()),
      this.parameters.slice(this.requiredCount).map((p) => p.canonicalize()),
      this.returnType.canonicalize(),
    );
  }

  override toString(addBrackets?: boolean): string {
    const params = this.parameters
      .map((p, i) => `p${i + 1}${i < this.requiredCount ? "" : "?"}: ${p}`)
      .join(", ");
    return addBrackets
      ? `((${params}) => ${this.returnType})`
      : `(${params}) => ${this.returnType}`;
  }

  // Workaround for: https://github.com/microsoft/TypeScript/issues/17473
  static is(t: any): t is InitiativeFunction {
    return t instanceof InitiativeFunction;
  }
}

type WrapArray<T extends unknown[]> = {
  [k in keyof T]: Type<T[k]>;
};

type MakeOptional<T> = {
  [k in keyof T]?: T[k];
};

interface InitiativeFunctionWithoutOptionalParameters<
  RequiredParameters extends unknown[],
> {
  <OptionalParameters extends unknown[]>(
    ...optionalParameters: WrapArray<OptionalParameters>
  ): InitiativeFunctionWithoutReturnType<
    RequiredParameters,
    OptionalParameters
  >;
}

interface InitiativeFunctionWithoutReturnType<
  RequiredParameters extends unknown[] = unknown[],
  OptionalParameters extends unknown[] = unknown[],
> {
  (): InitiativeFunction<RequiredParameters, OptionalParameters, void>;
  <ReturnType>(
    returnType: Type<ReturnType>,
  ): InitiativeFunction<RequiredParameters, OptionalParameters, ReturnType>;
}

function initiativeFunction<RequiredParameters extends unknown[]>(
  ...requiredParameters: WrapArray<RequiredParameters>
): InitiativeFunctionWithoutOptionalParameters<RequiredParameters> {
  return (...optionalParameters) =>
    (returnType = t.void() as any) =>
      intern(
        new InitiativeFunction(
          requiredParameters,
          optionalParameters,
          returnType,
        ).canonicalize(),
      ) as any;
}

export { InitiativeFunction as Function, initiativeFunction as function };
