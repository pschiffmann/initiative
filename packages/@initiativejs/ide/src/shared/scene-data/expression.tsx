import { JsonLiteralSchema, t } from "@initiativejs/schema";

export type ExpressionJson =
  | JsonLiteralExpressionJson
  | EnumValueExpressionJson
  | SceneInputExpressionJson
  | NodeOutputExpressionJson;

export interface JsonLiteralExpressionJson {
  readonly type: "json-literal";
  readonly schemaName: string;
  readonly value: unknown;
}

export interface EnumValueExpressionJson {
  readonly type: "enum-value";
  readonly value: string | number;
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

export type ExpressionSelectorJson =
  | PropertySelectorJson
  | MethodSelectorJson
  | CallSelectorJson;

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

export interface ValidateExpressionContext {
  /**
   * Throws an error if no literal with `literalName` exists.
   */
  getJsonLiteralSchema(schemaName: string): JsonLiteralSchema;

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
}

export interface ResolveExpressionContext extends ValidateExpressionContext {
  parameterPrefixes: Iterator<string>;
}

interface ExpressionParent {
  readonly expression: MemberAccessExpression;
  readonly index: number;
}

export abstract class Expression {
  constructor(readonly parent: ExpressionParent | null) {}

  withDeleted(): ExpressionJson | null {
    return this.parent?.expression.withArg(this.parent.index, null) ?? null;
  }

  abstract toJson(): ExpressionJson;

  static fromJson(
    json: ExpressionJson,
    inputType: t.Type,
    ctx: ValidateExpressionContext,
  ): Expression {
    return this._fromJson(
      json,
      inputType,
      { ...ctx, parameterPrefixes: generateParameterPrefixes() },
      null,
    );
  }

  protected static _fromJson(
    json: ExpressionJson,
    expectedType: t.Type,
    ctx: ResolveExpressionContext,
    parent: ExpressionParent | null,
  ): Expression {
    switch (json.type) {
      case "json-literal":
        return new JsonLiteralExpression(json, expectedType, ctx, parent);
      case "enum-value":
        return new EnumValueExpression(json, expectedType, parent);
      case "scene-input":
      case "node-output":
        return new MemberAccessExpression(json, expectedType, ctx, parent);
    }
  }
}

export class JsonLiteralExpression extends Expression {
  constructor(
    json: JsonLiteralExpressionJson,
    expectedType: t.Type,
    ctx: ResolveExpressionContext,
    parent: ExpressionParent | null,
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
    super(parent);
    this.value = json.value;
    this.schema = schema;
  }

  readonly value: unknown;
  readonly schema: JsonLiteralSchema;

  withValue(value: unknown): ExpressionJson {
    const json: JsonLiteralExpressionJson = {
      type: "json-literal",
      schemaName: this.schema!.name,
      value,
    };
    return this.parent?.expression.withArg(this.parent.index, json) ?? json;
  }

  override toString(): string {
    return this.schema.format(this.value);
  }

  override toJson(): ExpressionJson {
    return {
      type: "json-literal",
      schemaName: this.schema!.name,
      value: this.value,
    };
  }
}

export class EnumValueExpression extends Expression {
  constructor(
    json: EnumValueExpressionJson,
    expectedType: t.Type,
    parent: ExpressionParent | null,
  ) {
    const actualType = t.resolveType(json.value);
    if (!actualType.isAssignableTo(expectedType)) {
      throw new Error(
        `Value '${JSON.stringify(json.value)}' is not assignable to type ` +
          `'${expectedType}'.`,
      );
    }
    super(parent);
    this.value = json.value;
  }

  readonly value: string | number;

  withValue(value: string | number): ExpressionJson {
    const json: EnumValueExpressionJson = { type: "enum-value", value };
    return this.parent?.expression.withArg(this.parent.index, json) ?? json;
  }

  override toString(): string {
    return JSON.stringify(this.value);
  }

  override toJson(): ExpressionJson {
    return { type: "enum-value", value: this.value };
  }
}

type ExpressionSelector = PropertySelector | MethodSelector | CallSelector;

interface PropertySelector extends PropertySelectorJson {
  readonly memberType: t.Type;
}

interface MethodSelector extends Omit<MethodSelectorJson, "args"> {
  readonly memberType: t.Function;
}

interface CallSelector extends Omit<CallSelectorJson, "args"> {
  readonly memberType: t.Function;
}

export class MemberAccessExpression extends Expression {
  constructor(
    {
      selectors: selectorsJson,
      ...head
    }: SceneInputExpressionJson | NodeOutputExpressionJson,
    expectedType: t.Type,
    ctx: ResolveExpressionContext,
    parent: ExpressionParent | null,
  ) {
    super(parent);

    const parameterPrefix = ctx.parameterPrefixes.next().value!;

    let returnType =
      head.type === "scene-input"
        ? ctx.getSceneInputType(head.inputName)
        : ctx.getNodeOutputType(head.nodeId, head.outputName);
    const args: (Expression | null)[] = [];
    let isComplete = true;
    const selectors = selectorsJson.map<ExpressionSelector>((selector) => {
      const memberType = MemberAccessExpression.#resolveSelectorMemberType(
        selector,
        returnType,
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
        this,
        args.length,
      );
      returnType = fn.returnType;
      args.push(...selectorArgs.args);
      isComplete &&= selectorArgs.isComplete;
      return selector.type === "method"
        ? { type: "method", methodName: selector.methodName, memberType: fn }
        : { type: "call", memberType: fn };
    });

    if (!returnType.isAssignableTo(expectedType)) {
      throw new Error(
        `Type '${returnType}' is not assignable to type '${expectedType}'.`,
      );
    }

    this.head = head;
    this.selectors = selectors;
    this.args = args;
    this.parameterPrefix = parameterPrefix;
    this.isComplete = isComplete;
  }

  readonly head:
    | Omit<SceneInputExpressionJson, "selectors">
    | Omit<NodeOutputExpressionJson, "selectors">;

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

  /**
   * This is false if any required arg is missing, or any sub-expression is
   * incomplete.
   */
  readonly isComplete: boolean;

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
    const json: SceneInputExpressionJson | NodeOutputExpressionJson = {
      ...this.head,
      selectors: MemberAccessExpression.#generateSelectorJson(
        this.selectors,
        this.args.map((arg) => arg?.toJson() ?? null).with(index, arg),
      ),
    };
    return this.parent?.expression.withArg(this.parent.index, json) ?? json;
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
        : `<${this.head.nodeId}>.${this.head.outputName}`;

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
      result +=
        selector.type === "method"
          ? `.${selector.methodName}(${args})`
          : `(${args})`;
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
    }
  }

  static #resolveSelectorArgs(
    json: MethodSelectorJson | CallSelectorJson,
    memberType: t.Function,
    ctx: ResolveExpressionContext,
    parent: MemberAccessExpression,
    parentIndexStart: number,
  ): { args: (Expression | null)[]; isComplete: boolean } {
    if (json.args.length !== memberType.parameters.length) {
      const prefix =
        json.type === "method"
          ? `Method '${json.methodName}'`
          : `Function '${memberType}'`;
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
          { expression: parent, index: parentIndexStart + i },
        ),
    );
    const isComplete = args.every((arg, i) => {
      if (!arg && i < memberType.requiredCount) return false;
      return !(arg instanceof MemberAccessExpression) || arg.isComplete;
    });
    return { args, isComplete };
  }

  static #generateSelectorJson(
    selectors: readonly ExpressionSelector[],
    argsJson: readonly (ExpressionJson | null)[],
  ): ExpressionSelectorJson[] {
    let nextArg = 0;
    return selectors.flatMap((selector) => {
      if (selector.type === "property") {
        const { memberType, ...json } = selector;
        return json;
      }
      const { memberType, ...json } = selector;
      const args = argsJson.slice(
        nextArg,
        (nextArg += memberType.parameters.length),
      );
      return { ...json, args };
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
