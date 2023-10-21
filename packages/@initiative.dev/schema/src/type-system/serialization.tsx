import { Definitions } from "../definitions/index.js";
import * as t from "./index.js";

export type TypeJson =
  | AnyJson
  | ArrayJson
  | BooleanJson
  | EntityJson
  | FunctionJson
  | NullJson
  | NumberJson
  | StringJson
  | TupleJson
  | UndefinedJson
  | UnionJson
  | VoidJson;

export interface AnyJson {
  readonly type: "any";
}

export interface ArrayJson {
  readonly type: "array";
  readonly element: TypeJson;
}

export interface BooleanJson {
  readonly type: "boolean";
}

export interface EntityJson {
  readonly type: "entity";
  readonly name: string;
}

export interface FunctionJson {
  readonly type: "function";
  readonly requiredParameters: readonly TypeJson[];
  readonly optionalParameters: readonly TypeJson[];
  readonly returnType: TypeJson;
}

export interface NullJson {
  readonly type: "null";
}

export interface NumberJson {
  readonly type: "number";
  readonly value?: number;
}

export interface StringJson {
  readonly type: "string";
  readonly value?: string;
}

export interface TupleJson {
  readonly type: "tuple";
  readonly elements: readonly TypeJson[];
}

export interface UndefinedJson {
  readonly type: "undefined";
}

export interface UnionJson {
  readonly type: "union";
  readonly elements: readonly TypeJson[];
}

export interface VoidJson {
  readonly type: "void";
}

export function toJson(type: t.Type): TypeJson {
  if (type instanceof t.Any) {
    return { type: "any" };
  } else if (t.Array.is(type)) {
    return { type: "array", element: toJson(type.element) };
  } else if (type instanceof t.Boolean) {
    return { type: "boolean" };
  } else if (type instanceof t.Entity) {
    return { type: "entity", name: type.name };
  } else if (t.Function.is(type)) {
    return {
      type: "function",
      requiredParameters: type.parameters
        .slice(0, type.requiredCount)
        .map((p) => toJson(p)),
      optionalParameters: type.parameters
        .slice(type.requiredCount)
        .map((p) => toJson(p)),
      returnType: toJson(type.returnType),
    };
  } else if (type instanceof t.Null) {
    return { type: "null" };
  } else if (t.Number.is(type)) {
    return type.value === undefined
      ? { type: "number" }
      : { type: "number", value: type.value };
  } else if (t.String.is(type)) {
    return type.value === undefined
      ? { type: "string" }
      : { type: "string", value: type.value };
  } else if (t.Tuple.is(type)) {
    return { type: "tuple", elements: type.elements.map((e) => toJson(e)) };
  } else if (type instanceof t.Undefined) {
    return { type: "undefined" };
  } else if (t.Union.is(type)) {
    return { type: "union", elements: type.elements.map((e) => toJson(e)) };
  } else if (type instanceof t.Void) {
    return { type: "void" };
  } else {
    throw new Error("Unreachable");
  }
}

export function fromJson(json: TypeJson, definitions: Definitions): t.Type {
  switch (json.type) {
    case "any":
      return t.any();
    case "array":
      return t.array(fromJson(json.element, definitions));
    case "boolean":
      return t.boolean();
    case "entity":
      return definitions.getEntity(json.name);
    case "function": {
      const required = json.requiredParameters.map((p) =>
        fromJson(p, definitions),
      );
      const optional = json.optionalParameters.map((p) =>
        fromJson(p, definitions),
      );
      const returnType = fromJson(json.returnType, definitions);
      return t.function(...required)(...optional)(returnType);
    }
    case "null":
      return t.null();
    case "number":
      return t.number(json.value);
    case "string":
      return t.string(json.value);
    case "tuple":
      return t.tuple(...json.elements.map((e) => fromJson(e, definitions)));
    case "undefined":
      return t.undefined();
    case "union":
      return t.union(...json.elements.map((e) => fromJson(e, definitions)));
    case "void":
      return t.void();
  }
}
