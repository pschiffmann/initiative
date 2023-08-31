import * as t from "./index.js";
import { Type } from "./type.js";

class InitiativeFunction<
  P extends t.TypeArray = t.TypeArray,
  R extends Type = Type,
> extends Type<(...args: t.UnwrapArray<P>) => t.Unwrap<R>> {
  constructor(
    readonly parameters: P,
    readonly returns: R,
  ) {
    super();
  }

  protected override _isAssignableTo(other: Type): boolean {
    if (!InitiativeFunction.is(other)) return false;
    if (!this.returns.isAssignableTo(other.returns)) return false;
    for (let i = 0; i < this.parameters.length; i++) {
      const thisParam = this.parameters[i];
      const otherParam = other.parameters[i] ?? t.undefined();
      if (!otherParam.isAssignableTo(thisParam)) return false;
    }
    return true;
  }

  protected _compareTo(other: this): number {
    const paramCount = Math.max(
      this.parameters.length,
      other.parameters.length,
    );
    for (let i = 0; i < paramCount; i++) {
      const comparison = (this.parameters[i] ?? t.undefined()).compareTo(
        other.parameters[i] ?? t.undefined(),
      );
      if (comparison !== 0) return comparison;
    }
    return this.returns.compareTo(other.returns);
  }

  override canonicalize(): t.Type {
    return new InitiativeFunction(
      this.parameters.map((p) => p.canonicalize()),
      this.returns.canonicalize(),
    );
  }

  override toString(addBrackets?: boolean): string {
    const params = this.parameters
      .map((param, i) => `p${i + 1}: ${param}`)
      .join(", ");
    return addBrackets
      ? `((${params}) => ${this.returns})`
      : `(${params}) => ${this.returns}`;
  }

  // Workaround for: https://github.com/microsoft/TypeScript/issues/17473
  static is(t: any): t is InitiativeFunction {
    return t instanceof InitiativeFunction;
  }
}

interface InitiativeFunctionFactory<P extends t.TypeArray> {
  (): InitiativeFunction<P, t.Void>;
  <R extends Type>(returnType: R): InitiativeFunction<P, R>;
}

function initiativeFunction<P extends t.TypeArray>(
  ...args: P
): InitiativeFunctionFactory<P> {
  return function initiativeFunctionFactory(returnType = t.void()) {
    return new InitiativeFunction(args, returnType);
  };
}

export { InitiativeFunction as Function, initiativeFunction as function };
