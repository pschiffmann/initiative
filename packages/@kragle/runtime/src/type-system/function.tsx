import * as t from "./index.js";
import { KragleType } from "./kragle-type.js";

class KragleFunction<
  P extends t.KragleTypeArray = t.KragleTypeArray,
  R extends KragleType = KragleType
> extends KragleType<(...args: t.UnwrapArray<P>) => t.Unwrap<R>> {
  constructor(readonly parameters: P, readonly returns: R) {
    super();
  }

  protected override _isAssignableTo(other: KragleType): boolean {
    if (!KragleFunction.is(other)) return false;
    if (!this.returns.isAssignableTo(other.returns)) return false;
    for (let i = 0; i < this.parameters.length; i++) {
      const thisParam = this.parameters[i];
      const otherParam = other.parameters[i] ?? t.undefined();
      if (!otherParam.isAssignableTo(thisParam)) return false;
    }
    return true;
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
  static is(t: KragleType): t is KragleFunction {
    return t instanceof KragleFunction;
  }
}

interface KragleFunctionFactory<P extends t.KragleTypeArray> {
  (): KragleFunction<P, t.Void>;
  <R extends KragleType>(returnType: R): KragleFunction<P, R>;
}

function kragleFunction<P extends t.KragleTypeArray>(
  ...args: P
): KragleFunctionFactory<P> {
  return function kragleFunctionFactory(returnType = t.void()) {
    return new KragleFunction(args, returnType);
  };
}

export { KragleFunction as Function, kragleFunction as function };
