import { t } from "../../index.js";

/**
 * Expression serialization format.
 */
export type ExpressionJson =
  | StringLiteralExpressionJson
  | NumberLiteralExpressionJson
  | BooleanLiteralExpressionJson
  | EntityLiteralExpressionJson
  | LibraryMemberExpressionJson
  | SceneInputExpressionJson
  | NodeOutputExpressionJson
  | FunctionCallExpressionJson;

export interface StringLiteralExpressionJson {
  readonly type: "string-literal";
  readonly value: string;
}

// /**
//  * Same as `StringLiteralExpressionJson`, except that the IDE renders a textarea
//  * instead of a single line textfield to edit this value.
//  */
// export interface TextLiteralExpressionJson {
//   readonly type: "text-literal";
//   readonly value: string;
// }

export interface NumberLiteralExpressionJson {
  readonly type: "number-literal";
  readonly value: number;
}

export interface BooleanLiteralExpressionJson {
  readonly type: "boolean-literal";
  readonly value: boolean;
}

export interface EntityLiteralExpressionJson {
  readonly type: "entity-literal";
  readonly entityName: string;
  readonly value: unknown;
}

export interface LibraryMemberExpressionJson {
  readonly type: "library-member";
  readonly libraryName: string;
  readonly memberName: string;
}

export interface SceneInputExpressionJson {
  readonly type: "scene-input";
  readonly inputName: string;
}

export interface NodeOutputExpressionJson {
  readonly type: "node-output";
  readonly nodeId: string;
  readonly outputName: string;
}

export interface FunctionCallExpressionJson {
  readonly type: "function-call";
  readonly fn: ExpressionJson;
  readonly args: readonly (ExpressionJson | null)[];
}

export class Expression {
  constructor(
    json: ExpressionJson,
    expectedType: t.KragleType,
    ctx: ExpressionValidationContext
  ) {
    this.json = json = trimFunctionCallArguments(json);
    this.types = resolveTypes(json, ctx);
    this.errors = resolveErrors(json, this.types, expectedType);
  }

  readonly json: ExpressionJson;

  /**
   * Contains a key for every sub-expression of `json`. The value is `null` if
   * an expression type can't be resolved (e.g. `library-export` expressions
   * that use non-existent libraries).
   */
  readonly types: ReadonlyMap<ExpressionPath, t.KragleType | null>;

  /**
   * Contains a key for every erroneous sub-expression of `json`. The value is
   * the error message.
   */
  readonly errors: ReadonlyMap<ExpressionPath, string>;

  /**
   * Returns a copy of `json` with the expression at `path` set to `expression`.
   */
  set(
    path: ExpressionPath,
    expression: ExpressionJson | null
  ): ExpressionJson | null {
    function rebuild(
      json: ExpressionJson,
      path: readonly ExpressionPathSegment[]
    ): ExpressionJson | null {
      if (path.length === 0) return expression;
      if (json.type !== "function-call") throw new Error(`Invalid 'path'.`);
      const [segment, ...rest] = path;
      switch (segment.type) {
        case "fn": {
          const fn = rebuild(json.fn, rest);
          return fn && { ...json, fn };
        }
        case "arg": {
          const oldArg = json.args[segment.index];
          const args = [...json.args];
          if (oldArg) {
            args[segment.index] = rebuild(oldArg, rest);
          } else if (rest.length === 0) {
            args[segment.index] = expression;
          } else {
            throw new Error("Invalid path.");
          }
          return { ...json, args: args };
        }
      }
    }

    return rebuild(this.json, parseExpressionPath(path));
  }

  /**
   * Returns a copy of `this` with the expression at `path` wrapped in a
   * `function-call` expression.
   */
  callFunction(path: ExpressionPath): ExpressionJson {
    function rebuild(
      json: ExpressionJson,
      path: readonly ExpressionPathSegment[]
    ): ExpressionJson {
      if (path.length === 0) {
        return { type: "function-call", fn: json, args: [] };
      }
      if (json.type !== "function-call") throw new Error(`Invalid 'path'.`);
      const [segment, ...rest] = path;
      switch (segment.type) {
        case "fn":
          return { ...json, fn: rebuild(json.fn, rest) };
        case "arg": {
          const oldArg = json.args[segment.index];
          if (!oldArg) throw new Error("Invalid path.");
          const args = [...json.args];
          args[segment.index] = rebuild(oldArg, rest);
          return { ...json, args: args };
        }
      }
    }

    return rebuild(this.json, parseExpressionPath(path));
  }

  /**
   * Returns a copy of `json` where each expression is replaced by the result of
   * calling `callback()` with that expression.
   *
   * If `callback` doesn't replace any expressions, returns a reference to
   * `json` (`Object.is(expr.json, expr.map(...))` returns true).
   */
  map(
    callback: (json: ExpressionJson) => ExpressionJson | null
  ): ExpressionJson | null {
    function rebuild(json: ExpressionJson): ExpressionJson | null {
      const result = callback(json);
      if (result?.type !== "function-call") return result;

      const fn = rebuild(result.fn);
      if (!fn) return null;

      const args = result.args.map((arg) => arg && rebuild(arg));
      return fn === result.fn && args.every((arg, i) => arg === result.args[i])
        ? result
        : { type: "function-call", fn, args };
    }

    return rebuild(this.json);
  }

  format(): string {
    const types = this.types;

    function fmt(json: ExpressionJson): string {
      switch (json.type) {
        case "string-literal":
        case "number-literal":
        case "boolean-literal":
          return JSON.stringify(json.value);
        case "entity-literal": {
          const entity = types.get(json.entityName) as t.Entity | null;
          return entity?.literal?.format(json) ?? json.entityName;
        }
        case "node-output":
          return `${json.nodeId}::${json.outputName}`;
        case "scene-input":
          return `Scene::${json.inputName}`;
        case "library-member":
          return `${json.libraryName}::${json.memberName}`;
        case "function-call": {
          const parameters = json.args
            .map((p) => (p ? fmt(p) : "null"))
            .join(", ");
          return `${fmt(json.fn)}(${parameters})`;
        }
      }
    }

    return fmt(this.json);
  }
}

export interface ExpressionValidationContext {
  getEntity(entityName: string): t.Entity | null;

  getLibraryMemberType(
    libraryName: string,
    memberName: string
  ): t.KragleType | null;

  /**
   * Throws an error if `nodeId` is not an ancestor of the node this
   * expression belongs to; or if `nodeId` doesn't have an output with name
   * `outputName`; or if `outputName` is a scoped output and `nodeId` is not
   * a descendant of that slot.
   */
  getNodeOutputType(nodeId: string, outputName: string): t.KragleType;

  /**
   * Throws an error if `scene` doesn't have an input with name `inputName`.
   */
  getSceneInputType(inputName: string): t.KragleType;
}

/**
 * Resolves the types of all sub-expressions in `json`.
 */
function resolveTypes(
  json: ExpressionJson,
  ctx: ExpressionValidationContext
): ReadonlyMap<ExpressionPath, t.KragleType | null> {
  const types = new Map<ExpressionPath, t.KragleType | null>();

  function resolveType(
    json: ExpressionJson,
    path: ExpressionPath = ""
  ): t.KragleType | null {
    switch (json.type) {
      case "string-literal":
        return t.string(json.value);
      case "number-literal":
        return t.number(json.value);
      case "boolean-literal":
        return t.boolean(json.value);
      case "entity-literal":
        return ctx.getEntity(json.entityName);
      case "node-output":
        return ctx.getNodeOutputType(json.nodeId, json.outputName);
      case "scene-input":
        return ctx.getSceneInputType(json.inputName);
      case "library-member":
        return ctx.getLibraryMemberType(json.libraryName, json.memberName);
      case "function-call": {
        const functionPath = `${path}/fn`;
        const functionType = resolveType(json.fn, functionPath);
        types.set(functionPath, functionType);

        for (const [i, arg] of json.args.entries()) {
          const argPath = `${path}/arg(${i})`;
          const argType = arg && resolveType(arg);
          types.set(argPath, argType);
        }

        return functionType && t.Function.is(functionType)
          ? functionType.returns
          : null;
      }
    }
  }

  types.set("/", resolveType(json));
  return types;
}

function resolveErrors(
  json: ExpressionJson,
  types: Expression["types"],
  expectedType: t.KragleType
): ReadonlyMap<ExpressionPath, string> {
  const errors = new Map<ExpressionPath, string>();

  function resolveError(
    json: ExpressionJson,
    expectedType: t.KragleType,
    path: ExpressionPath = ""
  ): string | null {
    const type = types.get(path || "/");
    switch (json.type) {
      case "entity-literal":
        if (!type) {
          return `Entity '${json.entityName}' not found.`;
        } else if (!(type as t.Entity).literal) {
          return (
            `Entity '${json.entityName}' doesn't support literal ` +
            `expressions.`
          );
        }
        break;
      case "library-member":
        if (!type) {
          return (
            `Library export '${json.libraryName}::${json.memberName}' not ` +
            `found.`
          );
        }
        break;
      case "function-call": {
        const functionPath = `${path}/fn`;
        const functionError = resolveError(json.fn, t.any(), functionPath);
        if (functionError) errors.set(functionPath, functionError);
        const functionType = types.get(functionPath);

        if (functionType && t.Function.is(functionType)) {
          for (const [i, paramType] of functionType.parameters.entries()) {
            const argPath = `${path}/arg(${i})`;
            const argJson = json.args[i];
            if (argJson) {
              const argError = resolveError(argJson, paramType, argPath);
              if (argError) errors.set(argPath, argError);
            } else if (!t.undefined().isAssignableTo(paramType)) {
              errors.set(argPath, `This parameter is required.`);
            }
          }
          for (
            let i = functionType.parameters.length;
            i < json.args.length;
            i++
          ) {
            const argPath = `${path}/arg(${i})`;
            const argJson = json.args[i];
            if (argJson) {
              const argError = resolveError(argJson, t.any(), argPath);
              if (argError) errors.set(argPath, argError);
            }
          }
          if (json.args.length > functionType.parameters.length) {
            return (
              `Expected ${functionType.parameters.length} arguments, got ` +
              `${json.args.length}.`
            );
          }
        } else {
          for (const [i, argJson] of json.args.entries()) {
            if (!argJson) continue;
            const argPath = `${path}/arg(${i})`;
            const argError = resolveError(argJson, t.any(), argPath);
            if (argError) errors.set(argPath, argError);
          }
          return "This expression is not callable.";
        }
      }
    }
    return type?.isAssignableTo(expectedType)
      ? null
      : `Type '${type}' is not assignable to type '${expectedType}'.`;
  }

  const rootError = resolveError(json, expectedType);
  if (rootError) errors.set("/", rootError);
  return errors;
}

/**
 * Removes trailing `null`s from `"function-call"` arguments arrays.
 */
function trimFunctionCallArguments(json: ExpressionJson): ExpressionJson {
  if (json.type !== "function-call") return json;
  const fn = trimFunctionCallArguments(json.fn);
  const args = json.args.map((arg) => arg && trimFunctionCallArguments(arg));
  const lastNonNullIndex = args.findLastIndex((json) => !!json);
  return {
    type: "function-call",
    fn,
    args: args.slice(0, lastNonNullIndex + 1),
  };
}

//
// ExpressionPath
//

/**
 * An expression path points to a nested sub-expression in the expression tree.
 * - Path `/` points to the root expression.
 * - `/fn` points to the `function` property of a `function-call` expression.
 * - `/arg(0)` points to index 0 of the `arguments` property of a
 *   `function-call` expression.
 * - A path can have multiple segments, e.g. `/arg(2)/fn/arg(1)`.
 */
export type ExpressionPath = string;

type ExpressionPathSegment =
  | { readonly type: "fn" }
  | { readonly type: "arg"; readonly index: number };

function parseExpressionPath(path: string): ExpressionPathSegment[] {
  if (!path.startsWith("/")) {
    throw new Error(`Invalid expression path '${path}'.`);
  }
  if (path === "/") return [];
  return path
    .substring(1)
    .split("/")
    .map((segment) => {
      if (segment === "fn") return { type: "fn" };
      const match = segment.match(argPathSegmentPattern);
      if (match) return { type: "arg", index: Number.parseInt(match[1]) };
      throw new Error(`Invalid expression path '${path}'.`);
    });
}

const argPathSegmentPattern = /^arg\((\d+)\)$/;
