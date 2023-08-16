import { ComponentType } from "react";
import { Type } from "./type.js";

class InitiativeEntity<T = unknown> extends Type<T> {
  constructor(
    readonly name: string,

    /**
     * If this property exists, then constant expressions of this entity type
     * can be created in the IDE.
     */
    readonly literal?: EntityLiteralSupport<T>,
  ) {
    super();
  }

  protected override _isAssignableTo(other: Type): boolean {
    return this === other;
  }

  override toString(): string {
    return this.name;
  }
}

export interface EntityLiteralSupport<T = unknown> {
  /**
   * Returns a new entity instance for use as a `literal-expression` in the IDE.
   * `T` must be JSON-serializable.
   */
  create(): T;

  /**
   *
   * When a scene is loaded, all `"entity-literal"` expressions of this entity
   * type are passed to `validate()`. If `validate()` returns an error
   * message, then the expression is not set on the node.
   */
  validate(json: unknown): string | void;

  /**
   * Returns a human-readable description of this entity literal.
   */
  format(entity: T): string;

  /**
   * This component is rendered in the IDE to edit entity literals of this type.
   */
  Editor: ComponentType<{ value: T; onChange(value: T): void }>;
}

function initiativeEntity<T>(
  name: string,
  literal?: EntityLiteralSupport<T>,
): InitiativeEntity<T> {
  return new InitiativeEntity(name, literal);
}

export { InitiativeEntity as Entity, initiativeEntity as entity };
