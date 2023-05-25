import { KragleType } from "./kragle-type.js";

class KragleTypeVariable extends KragleType<unknown> {
  constructor(
    /**
     * The name of the node schema or function schema for which this type
     * variable was created. For debugging purposes only.
     */
    readonly schemaName: string,

    /**
     * The name of this type variable, e.g. `T1`.
     */
    readonly variableName: string
  ) {
    super();
  }

  override _isAssignableTo(other: KragleType): boolean {
    return other instanceof KragleTypeVariable ? this === other : true;
  }

  override toString(): string {
    return this.variableName;
  }
}

export { KragleTypeVariable as TypeVariable };
