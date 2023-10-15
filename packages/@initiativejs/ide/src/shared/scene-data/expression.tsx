import { FluentBundle, FluentResource } from "@fluent/bundle";
import {
  ExtensionMethodDefinition,
  JsonLiteralSchema,
  t,
} from "@initiativejs/schema";
import { ObjectMap } from "@pschiffmann/std/object-map";
import { fluentHelpers } from "../index.js";

export type ExpressionJson =
  | JsonLiteralExpressionJson
  | EnumValueExpressionJson
  | FluentMessageExpressionJson
  | SceneInputExpressionJson
  | NodeOutputExpressionJson
  | DebugValueExpressionJson;

export interface JsonLiteralExpressionJson {
  readonly type: "json-literal";
  readonly schemaName: string;
  readonly value: unknown;
}

export interface EnumValueExpressionJson {
  readonly type: "enum-value";
  readonly value: string | number;
}

export interface FluentMessageExpressionJson {
  readonly type: "fluent-message";

  /**
   * Keys are locales (like `"en"`, `"de"`), values are the localized messages.
   */
  readonly messages: ObjectMap<string>;

  /**
   * Keys are Fluent variables, values are expressions that provide the variable
   * value at runtime.
   *
   * Example: The Fluent message `Hello, { $user }!` contains a variable `user`
   * that needs to be interpolated at runtime. Fluent variables can only be
   * strings or numbers.
   */
  readonly args: ObjectMap<ExpressionJson>;
}

export interface SceneInputExpressionJson {
  readonly type: "scene-input";
  readonly inputName: string;
  readonly selectors: readonly ExpressionSelectorJson[];
}

export interface NodeOutputExpressionJson {
  readonly type: "node-output";
  readonly nodeId: string;
  readonly outputName: string;
  readonly selectors: readonly ExpressionSelectorJson[];
}

export interface DebugValueExpressionJson {
  readonly type: "debug-value";
  readonly debugValueName: string;
  readonly selectors: readonly ExpressionSelectorJson[];
}

export type ExpressionSelectorJson =
  | PropertySelectorJson
  | MethodSelectorJson
  | CallSelectorJson
  | ExtensionMethodSelectorJson;

export interface PropertySelectorJson {
  readonly type: "property";
  readonly propertyName: string;
}

export interface MethodSelectorJson {
  readonly type: "method";
  readonly methodName: string;
  readonly args: readonly (ExpressionJson | null)[];
}

export interface CallSelectorJson {
  readonly type: "call";
  readonly args: readonly (ExpressionJson | null)[];
}

export interface ExtensionMethodSelectorJson {
  readonly type: "extension-method";
  readonly extensionMethodName: string;
  readonly args: readonly (ExpressionJson | null)[];
}

export interface ValidateExpressionContext {
  /**
   * Contains the locales from the project `initiative.json` file, if set.
   */
  readonly locales?: readonly string[];

  /**
   * Throws an error if no literal with `schemaName` exists.
   */
  getJsonLiteralSchema(schemaName: string): JsonLiteralSchema;

  /**
   * Throwns an error if no extension method with `schemaName` exists.
   */
  getExtensionMethodDefinition(schemaName: string): ExtensionMethodDefinition;

  /**
   * Throws an error if `nodeId` is not an ancestor of the node this
   * expression belongs to; or if `nodeId` doesn't have an output with name
   * `outputName`; or if `outputName` is a scoped output and `nodeId` is not
   * a descendant of that slot.
   */
  getNodeOutputType(nodeId: string, outputName: string): t.Type;

  /**
   * Throws an error if `scene` doesn't have an input with name `inputName`.
   */
  getSceneInputType(inputName: string): t.Type;

  /**
   * Throws an error if no debug value with name `debugValueName` exists in
   * `Definitions`.
   */
  getDebugValueType(debugValueName: string): t.Type;
}

export interface ResolveExpressionContext extends ValidateExpressionContext {
  parameterPrefixes: Iterator<string>;
}

export abstract class Expression {
  constructor(readonly hasErrors: boolean) {}

  abstract toJson(): ExpressionJson;

  static fromJson(
    json: ExpressionJson,
    inputType: t.Type,
    ctx: ValidateExpressionContext,
  ): Expression {
    return this._fromJson(json, inputType, {
      ...ctx,
      parameterPrefixes: generateParameterPrefixes(),
    });
  }

  protected static _fromJson(
    json: ExpressionJson,
    expectedType: t.Type,
    ctx: ResolveExpressionContext,
  ): Expression {
    switch (json.type) {
      case "json-literal":
        return new JsonLiteralExpression(json, expectedType, ctx);
      case "enum-value":
        return new EnumValueExpression(json, expectedType);
      case "fluent-message":
        return new FluentMessageExpression(json, expectedType, ctx);
      case "scene-input":
      case "node-output":
      case "debug-value":
        return new MemberAccessExpression(json, expectedType, ctx);
    }
  }
}

export class JsonLiteralExpression extends Expression {
  constructor(
    json: JsonLiteralExpressionJson,
    expectedType: t.Type,
    ctx: ResolveExpressionContext,
  ) {
    const schema = ctx.getJsonLiteralSchema(json.schemaName);
    if (!schema.type.isAssignableTo(expectedType)) {
      throw new Error(
        `Expression '${JSON.stringify(json)}' is not assignable to type ` +
          `'${expectedType}'.`,
      );
    }
    const error = schema.validate(json.value);
    if (error) {
      throw new Error(
        `JSON literal '${JSON.stringify(json)}' is not a '${schema.name}' ` +
          `literal: ${error}`,
      );
    }
    super(false);
    this.value = json.value;
    this.schema = schema;
  }

  readonly value: unknown;
  readonly schema: JsonLiteralSchema;

  withValue(value: unknown): ExpressionJson {
    return { ...this.toJson(), value };
  }

  override toString(): string {
    return this.schema.format(this.value);
  }

  override toJson(): JsonLiteralExpressionJson {
    return {
      type: "json-literal",
      schemaName: this.schema!.name,
      value: this.value,
    };
  }
}

export class EnumValueExpression extends Expression {
  constructor(json: EnumValueExpressionJson, expectedType: t.Type) {
    const actualType = t.resolveType(json.value);
    if (!actualType.isAssignableTo(expectedType)) {
      throw new Error(
        `Value '${JSON.stringify(json.value)}' is not assignable to type ` +
          `'${expectedType}'.`,
      );
    }
    super(false);
    this.value = json.value;
  }

  readonly value: string | number;

  withValue(value: string | number): ExpressionJson {
    return { ...this.toJson(), value };
  }

  override toString(): string {
    return JSON.stringify(this.value);
  }

  override toJson(): EnumValueExpressionJson {
    return { type: "enum-value", value: this.value };
  }
}

export class FluentMessageExpression extends Expression {
  constructor(
    json: FluentMessageExpressionJson,
    expectedType: t.Type,
    ctx: ValidateExpressionContext,
  ) {
    if (!t.string().isAssignableTo(expectedType)) {
      throw new Error(
        `Expression of type 'fluent-message' evalutes to 'string', which is ` +
          `not assignable to type '${expectedType}'.`,
      );
    }

    const { locales } = ctx;
    if (!locales) {
      throw new Error(
        "Can't use 'fluent-message' expressions because localization is not " +
          "enabled for this project. To enable localization, add a 'locales' " +
          "key to the 'initiative.json' file.",
      );
    }

    let hasErrors = false;
    const messages: Record<string, string> = {};
    const variables = new Set<string>();
    for (const locale of locales) {
      const message = (messages[locale] = json.messages[locale] ?? "");
      const bundle = new FluentBundle(locales as string[]);
      bundle.addResource(
        new FluentResource(fluentHelpers.encodeFtl("message", message)),
      );
      const pattern = bundle.getMessage("message")?.value;
      if (pattern) {
        fluentHelpers.resolveFluentVariables(pattern, variables);
      } else {
        hasErrors = true;
      }
    }

    const args: Record<string, Expression | null> = {};
    for (const variable of [...variables].sort()) {
      const expressionJson = json.args[variable];
      if (expressionJson) {
        const expression = (args[variable] = Expression.fromJson(
          expressionJson,
          t.union(t.string(), t.number()),
          ctx,
        ));
        hasErrors ||= expression.hasErrors;
      } else {
        args[variable] = null;
        hasErrors = true;
      }
    }

    super(hasErrors);
    this.messages = messages;
    this.args = args;
  }

  readonly messages: ObjectMap<string>;
  readonly args: ObjectMap<Expression | null>;

  withMessage(locale: string, message: string): ExpressionJson {
    return {
      ...this.toJson(),
      messages: { ...this.messages, [locale]: message },
    };
  }

  withArg(variable: string, expression: ExpressionJson | null): ExpressionJson {
    const args: Record<string, ExpressionJson> = {};
    for (const [v, expr] of Object.entries(this.args)) {
      const json = v === variable ? expression : expr?.toJson();
      if (json) args[v] = json;
    }
    return { ...this.toJson(), args };
  }

  override toString(): string {
    return "{fluent-message}";
  }

  override toJson(): FluentMessageExpressionJson {
    const args: Record<string, ExpressionJson> = {};
    for (const [v, expr] of Object.entries(this.args)) {
      if (expr) args[v] = expr.toJson();
    }
    return { type: "fluent-message", messages: this.messages, args };
  }
}

type ExpressionSelector =
  | PropertySelector
  | MethodSelector
  | CallSelector
  | ExtensionMethodSelector;

interface PropertySelector extends PropertySelectorJson {
  readonly memberType: t.Type;
}

interface MethodSelector extends Omit<MethodSelectorJson, "args"> {
  readonly memberType: t.Function;
}

interface CallSelector extends Omit<CallSelectorJson, "args"> {
  readonly memberType: t.Function;
}

interface ExtensionMethodSelector
  extends Omit<ExtensionMethodSelectorJson, "extensionMethodName" | "args"> {
  readonly memberType: t.Function;
  readonly definition: ExtensionMethodDefinition;
}

export class MemberAccessExpression extends Expression {
  constructor(
    json:
      | SceneInputExpressionJson
      | NodeOutputExpressionJson
      | DebugValueExpressionJson,
    expectedType: t.Type,
    ctx: ResolveExpressionContext,
  ) {
    const { selectors: selectorsJson, ...head } = json;
    const parameterPrefix = ctx.parameterPrefixes.next().value!;

    let returnType =
      head.type === "scene-input"
        ? ctx.getSceneInputType(head.inputName)
        : head.type === "node-output"
        ? ctx.getNodeOutputType(head.nodeId, head.outputName)
        : ctx.getDebugValueType(head.debugValueName);
    const args: (Expression | null)[] = [];
    let hasErrors = false;
    const selectors = selectorsJson.map<ExpressionSelector>((selector) => {
      const memberType = MemberAccessExpression.#resolveSelectorMemberType(
        selector,
        returnType,
        ctx,
      );
      if (selector.type === "property") {
        returnType = memberType;
        return {
          type: "property",
          propertyName: selector.propertyName,
          memberType,
        };
      }
      const fn = memberType as t.Function;
      const selectorArgs = MemberAccessExpression.#resolveSelectorArgs(
        selector,
        fn,
        ctx,
      );
      returnType = fn.returnType;
      args.push(...selectorArgs.args);
      hasErrors ||= selectorArgs.hasErrors;
      switch (selector.type) {
        case "method":
          return {
            type: "method",
            methodName: selector.methodName,
            memberType: fn,
          };
        case "call":
          return { type: "call", memberType: fn };
        case "extension-method":
          return {
            type: "extension-method",
            memberType: fn,
            definition: ctx.getExtensionMethodDefinition(
              selector.extensionMethodName,
            ),
          };
      }
    });

    if (!returnType.isAssignableTo(expectedType)) {
      throw new Error(
        `Type '${returnType}' is not assignable to type '${expectedType}'.`,
      );
    }

    super(hasErrors);
    this.head = head;
    this.selectors = selectors;
    this.args = args;
    this.parameterPrefix = parameterPrefix;
  }

  readonly head:
    | Omit<SceneInputExpressionJson, "selectors">
    | Omit<NodeOutputExpressionJson, "selectors">
    | Omit<DebugValueExpressionJson, "selectors">;

  readonly selectors: readonly ExpressionSelector[];

  /**
   * `args.length` is exactly equal to the number of possible args in this
   * expression.
   */
  readonly args: readonly (Expression | null)[];

  /**
   * Used to stringify this expression, and have different parameter names in
   * sub-expressions.
   */
  readonly parameterPrefix: string;

  getExpectedTypeForArg(argIndex: number): [type: t.Type, optional: boolean] {
    for (const selector of this.selectors) {
      if (selector.type === "property") continue;
      if (argIndex < selector.memberType.parameters.length) {
        return [
          selector.memberType.parameters[argIndex],
          argIndex >= selector.memberType.requiredCount,
        ];
      }
      argIndex -= selector.memberType.parameters.length;
    }
    throw new Error(`Invalid index: ${argIndex}`);
  }

  withArg(index: number, arg: ExpressionJson | null): ExpressionJson {
    return {
      ...this.head,
      selectors: MemberAccessExpression.#generateSelectorJson(
        this.selectors,
        this.args.map((arg) => arg?.toJson() ?? null).with(index, arg),
      ),
    };
  }

  replaceNodeOutput(
    oldNodeId: string,
    newNodeId: string,
  ): ExpressionJson | null {
    const containsSearch = ({
      head,
      selectors,
    }: MemberAccessExpression): boolean =>
      (head.type === "node-output" && head.nodeId === oldNodeId) ||
      selectors.some(
        (selector) =>
          selector instanceof MemberAccessExpression &&
          containsSearch(selector),
      );
    if (!containsSearch(this)) return null;

    const rebuild = ({
      head,
      selectors,
      args,
    }: MemberAccessExpression): ExpressionJson => ({
      ...head,
      ...(head.type === "node-output" &&
        head.nodeId === oldNodeId && {
          nodeId: newNodeId,
        }),
      selectors: MemberAccessExpression.#generateSelectorJson(
        selectors,
        args.map((arg) =>
          arg instanceof MemberAccessExpression
            ? rebuild(arg)
            : arg?.toJson() ?? null,
        ),
      ),
    });
    return rebuild(this);
  }

  override toString(variant: "complete" | "truncated" = "complete"): string {
    let result =
      this.head.type === "scene-input"
        ? `Scene::${this.head.inputName}`
        : this.head.type === "node-output"
        ? `<${this.head.nodeId}>.${this.head.outputName}`
        : `DebugValue::${this.head.debugValueName}`;

    let i = 0;
    for (const selector of this.selectors) {
      if (selector.type === "property") {
        result += `.${selector.propertyName}`;
        continue;
      }
      const args =
        variant === "complete"
          ? this.args
              .slice(i, i + selector.memberType.parameters.length)
              .map((arg) => arg?.toString() ?? "∅")
              .join(", ")
          : t.Function.formatParameterList(selector.memberType, {
              prefix: this.parameterPrefix,
              startIndex: i + 1,
            });
      i += selector.memberType.parameters.length;
      switch (selector.type) {
        case "method":
          result += `.${selector.methodName}(${args})`;
          break;
        case "call":
          result += `(${args})`;
          break;
        case "extension-method": {
          const displayName = selector.definition.schema.name.split("::")[1];
          result += `.🅴${displayName}(${args})`;
          break;
        }
      }
    }
    return result;
  }

  override toJson(): ExpressionJson {
    return {
      ...this.head,
      selectors: MemberAccessExpression.#generateSelectorJson(
        this.selectors,
        this.args.map((arg) => arg?.toJson() ?? null),
      ),
    };
  }

  static #resolveSelectorMemberType(
    json: ExpressionSelectorJson,
    target: t.Type,
    ctx: ResolveExpressionContext,
  ): t.Type {
    switch (json.type) {
      case "property": {
        const { propertyName } = json;
        const memberType = target.properties[propertyName]?.type;
        if (!memberType) {
          throw new Error(
            `Property '${propertyName}' doesn't exist on type '${target}'.`,
          );
        }
        return memberType;
      }
      case "method": {
        const { methodName } = json;
        const memberType = target.methods[methodName]?.type;
        if (!memberType) {
          throw new Error(
            `Method '${methodName}' doesn't exist on type '${target}'.`,
          );
        }
        return memberType as t.Function;
      }
      case "call": {
        if (!t.Function.is(target)) {
          throw new Error(`Type '${target}' is not callable.`);
        }
        return target;
      }
      case "extension-method": {
        const name = json.extensionMethodName;
        const { schema } = ctx.getExtensionMethodDefinition(name);
        if (!target.isAssignableTo(schema.self)) {
          throw new Error(
            `Extension method '${name}' doesn't exist on type '${target}'.`,
          );
        }
        return schema.type;
      }
    }
  }

  static #resolveSelectorArgs(
    json: MethodSelectorJson | CallSelectorJson | ExtensionMethodSelectorJson,
    memberType: t.Function,
    ctx: ResolveExpressionContext,
  ): { args: (Expression | null)[]; hasErrors: boolean } {
    if (json.args.length !== memberType.parameters.length) {
      const prefix =
        json.type === "method"
          ? `Method '${json.methodName}'`
          : json.type === "call"
          ? `Function '${memberType}'`
          : `Extension method '${json.extensionMethodName}'`;
      throw new Error(
        `${prefix} expects ${memberType.parameters.length} arguments, but ` +
          `got ${json.args.length}.`,
      );
    }
    const args = json.args.map(
      (arg, i) =>
        arg &&
        Expression._fromJson(
          arg,
          i < memberType.requiredCount
            ? memberType.parameters[i]
            : t.optional(memberType.parameters[i]),
          ctx,
        ),
    );
    const hasErrors = args.some((arg, i) =>
      arg ? arg.hasErrors : i < memberType.requiredCount,
    );
    return { args, hasErrors };
  }

  static #generateSelectorJson(
    selectors: readonly ExpressionSelector[],
    argsJson: readonly (ExpressionJson | null)[],
  ): ExpressionSelectorJson[] {
    let nextArg = 0;
    return selectors.flatMap((selector) => {
      switch (selector.type) {
        case "property": {
          const { memberType, ...json } = selector;
          return json;
        }
        case "method":
        case "call": {
          const { memberType, ...json } = selector;
          const args = argsJson.slice(
            nextArg,
            (nextArg += memberType.parameters.length),
          );
          return { ...json, args };
        }
        case "extension-method": {
          const { memberType, definition } = selector;
          const args = argsJson.slice(
            nextArg,
            (nextArg += memberType.parameters.length),
          );
          return {
            type: "extension-method",
            extensionMethodName: definition.schema.name,
            args,
          };
        }
      }
    });
  }
}

/**
 * Returns a generator for parameter name prefixes, beginning from `p`, `q`,
 * `r`, ...
 */
function* generateParameterPrefixes() {
  for (let i = 0; ; i = (i + 1) % 26) {
    yield String.fromCharCode(112 + i);
  }
}
