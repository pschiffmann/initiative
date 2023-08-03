import * as t from "../type-system/index.js";
import {
  validateLibraryExportName,
  validateLibraryName,
} from "../validate-names.js";

export class LibrarySchema<M extends t.KragleTypeRecord = {}> {
  constructor(
    readonly name: string,
    members: M,
  ) {
    validateLibraryName(name);

    const canonicalizedMembers: Record<string, t.KragleType> = {};
    for (const [memberName, type] of Object.entries(members)) {
      validateLibraryExportName(name, memberName);
      canonicalizedMembers[memberName] = type.canonicalize();
    }
    this.members = canonicalizedMembers;
  }

  readonly members: t.KragleTypeRecord;
}

export type InferLibraryMembers<L extends LibrarySchema> =
  L extends LibrarySchema<infer M> ? t.UnwrapRecord<M> : {};
