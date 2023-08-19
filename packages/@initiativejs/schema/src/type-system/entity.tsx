import { Type } from "./type.js";

class InitiativeEntity<T = unknown> extends Type<T> {
  constructor(readonly name: string) {
    super();
  }

  protected override _isAssignableTo(other: Type): boolean {
    return this === other;
  }

  override toString(): string {
    return this.name;
  }
}

function initiativeEntity<T>(name: string): InitiativeEntity<T> {
  return new InitiativeEntity(name);
}

export { InitiativeEntity as Entity, initiativeEntity as entity };
