export interface SceneJson {
  /**
   * The scene type.
   */
  // readonly type: string;

  readonly rootNode: string;
  readonly nodes: Readonly<Record<string, NodeJson>>;
  readonly constants?: Readonly<Record<string, string | number | boolean>>;
}

export interface NodeJson {
  readonly type: string;

  /**
   * Mapping from input name to property binding. Property bindings use the
   * format `<nodeId>::<output>`. Constant bindings use the format
   * `constant::<constantId>`.
   */
  readonly inputs?: Readonly<Record<string, string>>;

  /**
   * Mapping from slot name to child node id.
   */
  readonly slots?: Readonly<Record<string, string>>;
}
