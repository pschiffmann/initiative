import * as $Array from "@pschiffmann/std/array";
import { t } from "../../index.js";

/**
 * Expression serialization format.
 */
export type ExpressionJson =
  | StringLiteralExpressionJson
  | NumberLiteralExpressionJson
  | BooleanLiteralExpressionJson
  | EntityLiteralExpressionJson
  | NodeOutputExpressionJson
  | SceneInputExpressionJson
  | LibraryExportExpressionJson
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

export interface NodeOutputExpressionJson {
  readonly type: "node-output";
  readonly nodeId: string;
  readonly outputName: string;
}

export interface SceneInputExpressionJson {
  readonly type: "scene-input";
  readonly inputName: string;
}

export interface LibraryExportExpressionJson {
  readonly type: "library-export";
  readonly libraryName: string;
  readonly exportName: string;
}

export interface FunctionCallExpressionJson {
  readonly type: "function-call";
  readonly function: ExpressionJson;
  readonly arguments: readonly (ExpressionJson | null)[];
}

export class Expression {
  private constructor(
    readonly json: ExpressionJson,
    readonly isComplete: boolean,
    readonly type: t.KragleType
  ) {}

  /**
   * Returns a copy of `this` with the function argument at `path` set to
   * `argument`.
   *
   * Throws an error if `path` doesn't point to a `function-call` argument
   * index.
   */
  setFunctionArgument(
    argument: ExpressionJson | null,
    path: readonly number[],
    ctx: ExpressionValidationContext
  ): Expression | null {
    function rebuild(
      json: ExpressionJson,
      path: readonly number[]
    ): ExpressionJson | null {
      if (path.length === 0) return argument;
      const [index, ...rest] = path;
      if (
        json.type !== "function-call" ||
        !$Array.isValidIndexFor(json.arguments, index)
      ) {
        throw new Error(`Invalid 'path'.`);
      }
      const args = [...json.arguments];
      args[index] = rebuild(json.arguments[index]!, rest);
      return { ...json, arguments: args };
    }

    const json = rebuild(this.json, path);
    return json && Expression.fromJson(json, ctx);
  }

  /**
   * Returns a copy of `this` with the expression at `path` wrapped in a
   * `function-call` expression.
   *
   * Throws an error if `path` doesn't point to a `function-call` argument
   * index, or if the resolved type of the expression at `path` is not a
   * `t.Function`.
   */
  callFunction(
    path: readonly number[],
    ctx: ExpressionValidationContext
  ): Expression {
    function rebuild(
      json: ExpressionJson,
      path: readonly number[]
    ): ExpressionJson {
      if (path.length === 0) {
        const calleeType = assertIsCallable(json, ctx);
        return {
          type: "function-call",
          function: json,
          arguments: calleeType.parameters.map(() => null),
        };
      }
      const [index, ...rest] = path;
      if (
        json.type !== "function-call" ||
        !$Array.isValidIndexFor(json.arguments, index)
      ) {
        throw new Error(`Invalid 'path'.`);
      }
      const args = [...json.arguments];
      args[index] = rebuild(json.arguments[index]!, rest);
      return { ...json, arguments: args };
    }

    return Expression.fromJson(rebuild(this.json, path), ctx);
  }

  format(ctx: Pick<ExpressionValidationContext, "getEntity">): string {
    return format(this.json, ctx);
  }

  static fromJson(
    json: ExpressionJson,
    ctx: ExpressionValidationContext
  ): Expression {
    return new Expression(json, ...validate(json, ctx));
  }
}

export interface ExpressionValidationContext {
  /**
   * Throws an error if no entity with name `entityName` is defined.
   */
  getEntity(entityName: string): t.Entity;

  /**
   * Throws an error if `nodeId` is not an ancestor of the node this
   * expression belongs to, or if `nodeId` doesn't have an output with name
   * `outputName`.
   */
  getNodeOutputType(nodeId: string, outputName: string): t.KragleType;

  /**
   * Throws an error if `scene` doesn't have an input with name `inputName`.
   */
  getSceneInputType(inputName: string): t.KragleType;

  /**
   * Throws an error if `libraryName` is not defined, or if the library has
   * no export with name `exportName`.
   */
  getLibraryExportType(libraryName: string, exportName: string): t.KragleType;
}

/**
 * This function deviates from the general rule to only perform runtime
 * validation for things that can't be caught by TypeScript. In particular, it
 * performs a `typeof json.value` check for `string-literal`, `number-literal`
 * and `boolean-literal` expressions. That's because the `json` values are not
 * always created in TypeScript, this function also processes raw values read
 * from scene JSON files.
 */
function validate(
  json: ExpressionJson,
  ctx: ExpressionValidationContext
): [isComplete: boolean, type: t.KragleType] {
  switch (json.type) {
    case "string-literal":
      if (typeof json.value !== "string") {
        throw new Error(
          `Invalid string literal expression '${JSON.stringify(json)}': ` +
            `'value' must be of type string.`
        );
      }
      return [true, t.string(json.value)];

    case "number-literal":
      if (typeof json.value !== "number") {
        throw new Error(
          `Invalid number literal expression '${JSON.stringify(json)}': ` +
            `'value' must be of type number.`
        );
      }
      return [true, t.number(json.value)];

    case "boolean-literal":
      if (typeof json.value !== "boolean") {
        throw new Error(
          `Invalid boolean literal expression '${JSON.stringify(json)}': ` +
            `'value' must be of type boolean.`
        );
      }
      return [true, t.boolean(json.value)];

    case "entity-literal": {
      const entity = ctx.getEntity(json.entityName);
      if (!entity.literal) {
        throw new Error(
          `Can't create entity literal expressions for '${entity.name}' ` +
            `because the entity definition has no 'validate()' function.`
        );
      }
      const error = entity.literal.validate(json.value);
      if (error) {
        throw new Error(
          `Invalid entity literal expression '${JSON.stringify(json)}': ` +
            error
        );
      }
      return [true, entity];
    }

    case "node-output":
      return [true, ctx.getNodeOutputType(json.nodeId, json.outputName)];

    case "scene-input":
      return [true, ctx.getSceneInputType(json.inputName)];

    case "library-export":
      return [
        true,
        ctx.getLibraryExportType(json.libraryName, json.exportName),
      ];

    case "function-call": {
      const [calleeComplete, calleeType] = validate(json.function, ctx);
      if (!t.Function.is(calleeType)) {
        throw new Error(
          `Expression '${format(json.function, ctx)}' is not callable.`
        );
      }
      if (calleeType.parameters.length !== json.arguments.length) {
        throw new Error(
          `Calling expression '${format(json.function, ctx)}' requires ` +
            `${calleeType.parameters.length} arguments, but ` +
            `${json.arguments.length} were provided.`
        );
      }

      let isComplete = calleeComplete;
      for (const [i, parameterType] of calleeType.parameters.entries()) {
        const argument = json.arguments[i];
        if (!argument) {
          isComplete &&= t.undefined().isAssignableTo(parameterType);
          continue;
        }
        const [argumentComplete, argumentType] = validate(argument, ctx);
        if (!argumentType.isAssignableTo(parameterType)) {
          throw new Error(
            `Argument '${format(argument, ctx)}' of type '${argumentType}' ` +
              `is not assignable to parameter type '${parameterType}' of ` +
              `function '${format(json.function, ctx)}'.`
          );
        }
        isComplete &&= argumentComplete;
      }
      return [isComplete, calleeType.returns];
    }

    default:
      throw new Error("Unimplemented");
  }
}

function format(
  json: ExpressionJson,
  ctx: Pick<ExpressionValidationContext, "getEntity">
  // , indent = false
): string {
  switch (json.type) {
    case "string-literal":
    case "number-literal":
    case "boolean-literal":
      return JSON.stringify(json.value);
    case "entity-literal": {
      const entity = ctx.getEntity(json.entityName);
      return entity.literal!.format(json);
    }
    case "node-output":
      return `${json.nodeId}::${json.outputName}`;
    case "scene-input":
      return `Scene::${json.inputName}`;
    case "library-export":
      return `${json.libraryName}::${json.exportName}`;
    case "function-call": {
      const parameters = json.arguments
        .map((p) => (p ? format(p, ctx) : "?"))
        .join(", ");
      return `${format(json.function, ctx)}(${parameters})`;
    }
    default:
      throw new Error("Unimplemented");
  }
}

function assertIsCallable(
  json: ExpressionJson,
  ctx: ExpressionValidationContext
): t.Function {
  let type: t.KragleType | undefined;
  switch (json.type) {
    case "node-output":
      type = ctx.getNodeOutputType(json.nodeId, json.outputName);
      break;
    case "scene-input":
      type = ctx.getSceneInputType(json.inputName);
      break;

    case "library-export":
      type = ctx.getLibraryExportType(json.libraryName, json.exportName);
      break;
    case "function-call":
      type = assertIsCallable(json.function, ctx);
      break;
  }
  if (type && t.Function.is(type)) return type;
  throw new Error(`Expression '${format(json, ctx)}' is not callable.`);
}
