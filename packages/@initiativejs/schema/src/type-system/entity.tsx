import { lazy } from "./lazy.js";
import { Type } from "./type.js";

class InitiativeEntity<T = unknown> extends Type<T> {
  constructor(
    readonly name: string,
    readonly properties: EntityProperties<T> = {},
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

type EntityProperties<T> = {
  readonly [K in keyof T]?: Type<T[K]>;
};

type LazyFactory = typeof lazy;

/**
 * ## Basic use
 *
 * ```ts
 * interface Person {
 *   name: string;
 *   age: number;
 * }
 *
 * const person = t.entity<Person>("person", {
 *   name: t.string(),
 * });
 * ```
 *
 * ## Recursive types
 *
 * To define a recursive type, pass a callback function to `entity()` instead.
 * Also note the explicit `ReturnType<...>` annotation on the entity – this is
 * required to suppress TypeScript error _ts(7022)_.
 *
 * ```ts
 * interface Person {
 *   name: string;
 *   friend: Person;
 * }
 *
 * const person: ReturnType<typeof t.entity<Person>> = t.entity<Person>(
 *   "person",
 *   (lazy) => ({
 *     name: t.string(),
 *     friend: lazy(() => person),
 *   }),
 * );
 * ```
 */
function initiativeEntity<T>(
  name: string,
  properties?:
    | EntityProperties<T>
    | ((lazy: LazyFactory) => EntityProperties<T>),
): () => InitiativeEntity<T> {
  const entity = new InitiativeEntity(
    name,
    typeof properties === "function" ? properties(lazy) : properties,
  );
  return () => entity;
}

export { InitiativeEntity as Entity, initiativeEntity as entity };
