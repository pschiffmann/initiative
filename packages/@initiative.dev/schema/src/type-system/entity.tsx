import { intern } from "./interning.js";
import { MembersFactory, Type } from "./type.js";

export interface EntityTypeSource {
  readonly moduleName: string;
  readonly exportName: string;
}

class InitiativeEntity<T = unknown> extends Type<T> {
  constructor(
    readonly name: string,
    readonly typeSource: EntityTypeSource,
    members: MembersFactory<T>,
  ) {
    super(members);
  }

  protected override _isAssignableTo(other: Type): boolean {
    return this === other;
  }

  protected _compareTo(other: this): number {
    return this.name.localeCompare(other.name);
  }

  override toString(): string {
    return this.name;
  }
}

/**
 * ## Basic use
 *
 * ```ts
 * interface Person {
 *   name: string;
 *   age: number;
 *   getDisplayName(): string;
 * }
 *
 * const person = t.entity<Person>("person", () => ({
 *   properties: {
 *     name: {
 *       type: t.string(),
 *     },
 *     age: {
 *       type: t.number(),
 *     },
 *   },
 *   methods: {
 *     getDisplayName: {
 *       type: t.function()()(t.string()),
 *     },
 *   },
 * }));
 * ```
 *
 * ## Recursive types
 *
 * When defining recursive types, you need to add an explicit `ReturnType<...>`
 * annotation on the entity to suppress TypeScript error _ts(7022)_.
 *
 * ```ts
 * interface Person {
 *   name: string;
 *   friend: Person;
 * }
 *
 * const person: ReturnType<typeof t.entity<Person>> = t.entity<Person>(
 *   "person",
 *   () => ({
 *     properties: {
 *       name: {
 *         type: t.string(),
 *       },
 *       friend: {
 *         type: person(),
 *       },
 *     },
 *   }),
 * );
 * ```
 */
function initiativeEntity<T>(
  name: string,
  typeSource: EntityTypeSource,
  members: MembersFactory<T> = null,
): () => InitiativeEntity<T> {
  const entity = new InitiativeEntity<T>(name, typeSource, members);
  const interned = intern(entity);
  if (entity !== interned) {
    throw new Error(`Entity with name '${name}' is already defined.`);
  }
  return () => entity;
}

export { InitiativeEntity as Entity, initiativeEntity as entity };
