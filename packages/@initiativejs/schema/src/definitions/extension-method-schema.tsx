import * as t from "../type-system/index.js";

export interface ExtensionMethodSchemaInit<
  Self = unknown,
  RequiredParameters extends unknown[] = unknown[],
  OptionalParameters extends unknown[] = unknown[],
  ReturnType = unknown,
> {
  readonly name: string;
  readonly self: t.Type<Self>;
  readonly type: t.Function<RequiredParameters, OptionalParameters, ReturnType>;
  readonly doc?: string;
}

export class ExtensionMethodSchema<
  Self = unknown,
  RequiredParameters extends unknown[] = unknown[],
  OptionalParameters extends unknown[] = unknown[],
  ReturnType = unknown,
> {
  constructor(
    init: ExtensionMethodSchemaInit<
      Self,
      RequiredParameters,
      OptionalParameters,
      ReturnType
    >,
  ) {
    this.name = init.name;
    this.self = init.self;
    this.type = init.type;
    this.doc = init.doc;
  }

  readonly name: string;
  readonly self: t.Type<Self>;
  readonly type: t.Function<RequiredParameters, OptionalParameters, ReturnType>;
  readonly doc?: string;
}

export type ExtensionMethodType<S extends ExtensionMethodSchema> =
  S extends ExtensionMethodSchema<
    infer Self,
    infer RequiredParameters,
    infer OptionalParameters,
    infer ReturnType
  >
    ? (...p: [Self, ...RequiredParameters, ...OptionalParameters]) => ReturnType
    : never;
