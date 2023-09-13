import { t } from "../index.js";
import { trimDocText } from "../util/trim-doc-text.js";
import { intern } from "./interning.js";
import { Members, Type } from "./type.js";

class InitiativeString<T extends string = string> extends Type<T> {
  constructor(readonly value?: T) {
    super(members as any);
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
        doc: `The length of the string in UTF-16 code units.`,
      },
    },
    methods: {
      endsWith: {
        type: t.function(t.string())(t.number())(t.boolean()),
        doc: trimDocText(
          `Determines whether a string ends with the characters of searchString.

           ## Parameters

           - searchString: string | The characters to be searched for at the end
             of this string.

           - endPosition?: number | The end position at which searchString is
             expected to be found (the index of searchString's last character
             plus 1). Defaults to string.length.`,
        ),
      },
      includes: {
        type: t.function(t.string())(t.number())(t.boolean()),
        doc: trimDocText(
          `Determines whether a string contains the characters of searchString.

           ## Parameters

           - searchString: string | A string to be searched for within this
             string.

           - position?: number | The position within the string at which to
             begin searching for searchString. (Defaults to 0.)`,
        ),
      },
      indexOf: {
        type: t.function(t.string())(t.number())(t.number()),
        doc: trimDocText(
          `Searches this string and returns the index of the first occurrence of
           the specified substring.

           ## Parameters

           - searchString: string | Substring to search for.

           - position?: number | The position within the string at which to
             begin searching for searchString. (Defaults to 0.)`,
        ),
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
        doc: trimDocText(
          `The substring() method of String values returns the part of this
           string from the start index up to and excluding the end index, or to
           the end of the string if no end index is supplied.

           ## Parameters

           - startIndex: number | The index of the first character to include
             in the returned substring.

           - endIndex?: number | The index of the first character to exclude
             from the returned substring.`,
        ),
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
