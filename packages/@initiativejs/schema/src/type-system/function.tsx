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
    readonly requiredParameters: WrapArray<RequiredParameters>,
    readonly optionalParameters: WrapArray<OptionalParameters>,
    readonly returnType: Type<ReturnType>,
  ) {
    super();
  }

  protected override _isAssignableTo(other: Type): boolean {
    if (!InitiativeFunction.is(other)) return false;
    if (!this.returnType.isAssignableTo(other.returnType)) return false;

    if (this.requiredParameters.length < other.requiredParameters.length) {
      return false;
    }
    for (
      let i = 0;
      i < this.requiredParameters.length + this.optionalParameters.length;
      i++
    ) {
      const thisParam =
        i < this.requiredParameters.length
          ? this.requiredParameters[i]
          : this.optionalParameters[i - this.requiredParameters.length];
      const otherParam =
        i < other.requiredParameters.length
          ? other.requiredParameters[i]
          : other.optionalParameters[i - other.requiredParameters.length];
      if (!otherParam.isAssignableTo(thisParam)) return false;
    }

    return true;
  }

  protected _compareTo(other: this): number {
    if (this.requiredParameters.length !== other.requiredParameters.length) {
      return this.requiredParameters.length - other.requiredParameters.length;
    }
    if (this.optionalParameters.length !== other.optionalParameters.length) {
      return this.optionalParameters.length - other.optionalParameters.length;
    }
    for (
      let i = 0;
      i < this.requiredParameters.length + this.optionalParameters.length;
      i++
    ) {
      const thisParam =
        i < this.requiredParameters.length
          ? this.requiredParameters[i]
          : this.optionalParameters[i - this.requiredParameters.length];
      const otherParam =
        i < other.requiredParameters.length
          ? other.requiredParameters[i]
          : other.optionalParameters[i - other.requiredParameters.length];
      const comparison = thisParam.compareTo(otherParam);
      if (comparison !== 0) return comparison;
    }
    return this.returnType.compareTo(other.returnType);
  }

  override canonicalize(): t.Type {
    return new InitiativeFunction(
      this.requiredParameters.map((p) => p.canonicalize()),
      this.optionalParameters.map((p) => p.canonicalize()),
      this.returnType.canonicalize(),
    );
  }

  override toString(addBrackets?: boolean): string {
    const params = [
      ...this.requiredParameters.map((param, i) => `p${i + 1}: ${param}`),
      ...this.optionalParameters.map((param, i) => `p${i + 1}?: ${param}`),
    ].join(", ");
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
