import * as t from "./type-system/index.js";

export class SceneSpec<I extends t.KragleTypeRecord = {}> {
  constructor(readonly name: string, { inputs }: Omit<SceneSpec<I>, "name">) {
    this.inputs = inputs;
  }

  readonly inputs?: I;
}

export type InferProps<N extends SceneSpec> = N extends SceneSpec<infer I>
  ? t.UnwrapRecord<I>
  : {};
