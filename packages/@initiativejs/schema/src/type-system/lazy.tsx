import { Entity } from "./entity.js";
import { Type } from "./type.js";

export type LazyResolve<T> = () => Entity<T>;

class InitiativeLazy<T> extends Type<T> {
  constructor(readonly resolve: LazyResolve<T>) {
    super();
  }

  protected override _isAssignableTo(other: Type): boolean {
    return (this.resolve() as any)._isAssignableTo(other);
  }

  protected _compareTo(other: this): number {
    return this.resolve().compareTo(other);
  }

  override canonicalize(): Type {
    return this.resolve();
  }

  override toString(): string {
    return `lazy(${this.resolve().name})`;
  }
}

function initiativeLazy<T>(resolve: LazyResolve<T>): InitiativeLazy<T> {
  return new InitiativeLazy(resolve);
}

export { InitiativeLazy as Lazy, initiativeLazy as lazy };
