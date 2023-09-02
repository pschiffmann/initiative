import { t } from "../index.js";
import { intern } from "./interning.js";
import { Members, Type } from "./type.js";

class InitiativeString<T extends string = string> extends Type<T> {
  constructor(readonly value?: T) {
    super(() => members as any);
  }

  protected override _isAssignableTo(other: Type): boolean {
    return (
      InitiativeString.is(other) &&
      (other.value === undefined || other.value === this.value)
    );
  }

  protected override _compareTo(other: this): number {
    if (this.value === other.value) return 0;
    if (this.value === undefined) return -1;
    if (other.value === undefined) return 1;
    return this.value.localeCompare(other.value);
  }

  override toString(): string {
    return this.value === undefined
      ? "string"
      : `"${this.value.replaceAll(/["\\]/g, (m) => `\\${m}`)}"`;
  }

  // Workaround for: https://github.com/microsoft/TypeScript/issues/17473
  static is(t: Type): t is InitiativeString {
    return t instanceof InitiativeString;
  }
}

function members(): Members<
  Pick<
    string,
    | "length"
    | "endsWith"
    | "includes"
    | "indexOf"
    | "lastIndexOf"
    | "padEnd"
    | "padStart"
    | "repeat"
    | "replace"
    | "replaceAll"
    | "split"
    | "startsWith"
    | "substring"
    | "toLowerCase"
    | "toUpperCase"
    | "trim"
    | "trimEnd"
    | "trimStart"
  >
> {
  return {
    properties: {
      length: {
        type: t.number(),
      },
    },
    methods: {
      endsWith: {
        type: t.function(t.string())(t.number())(t.boolean()),
      },
      includes: {
        type: t.function(t.string())(t.number())(t.boolean()),
      },
      indexOf: {
        type: t.function(t.string())(t.number())(t.number()),
      },
      lastIndexOf: {
        type: t.function(t.string())(t.number())(t.number()),
      },
      padEnd: {
        type: t.function(t.number())(t.string())(t.string()),
      },
      padStart: {
        type: t.function(t.number())(t.string())(t.string()),
      },
      repeat: {
        type: t.function(t.number())()(t.string()),
      },
      split: {
        type: t.function(t.string())(t.number())(t.array(t.string())) as any,
      },
      startsWith: {
        type: t.function(t.string())(t.number())(t.boolean()),
      },
      substring: {
        type: t.function(t.number())(t.number())(t.string()),
      },
      toLowerCase: {
        type: t.function()()(t.string()),
      },
      toUpperCase: {
        type: t.function()()(t.string()),
      },
      trim: {
        type: t.function()()(t.string()),
      },
      trimEnd: {
        type: t.function()()(t.string()),
      },
      trimStart: {
        type: t.function()()(t.string()),
      },
    },
  };
}

function initiativeString<T extends string>(value?: T): InitiativeString<T> {
  return intern(new InitiativeString(value));
}

export { InitiativeString as String, initiativeString as string };
