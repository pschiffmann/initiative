import * as t from "../type-system/index.js";
import {
  validateLibraryExportName,
  validateLibraryName,
} from "../validate-names.js";

export class LibrarySchema<M extends t.TypeRecord = {}> {
  constructor(
    readonly name: string,
    members: M,
  ) {
    validateLibraryName(name);

    const canonicalizedMembers: Record<string, t.Type> = {};
    for (const [memberName, type] of Object.entries(members)) {
      validateLibraryExportName(name, memberName);
      canonicalizedMembers[memberName] = type.canonicalize();
    }
    this.members = canonicalizedMembers;
  }

  readonly members: t.TypeRecord;
}

export type InferLibraryMembers<L extends LibrarySchema> =
  L extends LibrarySchema<infer M> ? t.UnwrapRecord<M> : {};
