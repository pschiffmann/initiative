import * as t from "./index.js";
import { Members, Type } from "./type.js";

class InitiativeBoolean extends Type<boolean> {
  constructor() {
    super(members as any);
  }

  protected override _isAssignableTo(other: Type): boolean {
    return other instanceof InitiativeBoolean;
  }

  override toString(): string {
    return "boolean";
  }
}

function members(): Members<Pick<Object, "toString">> {
  return {
    methods: {
      toString: {
        type: t.function()()(t.string()),
      },
    },
  };
}

const instance = new InitiativeBoolean();

function initiativeBoolean(): InitiativeBoolean {
  return instance;
}

export { InitiativeBoolean as Boolean, initiativeBoolean as boolean };
