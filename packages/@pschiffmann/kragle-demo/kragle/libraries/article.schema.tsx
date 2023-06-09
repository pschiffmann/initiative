import { t } from "@kragle/runtime";
import { InferLibraryMembers, LibrarySchema } from "@kragle/runtime/v2";

export interface Article {
  id: number;
  name: string;
  price: number;
}

export const articleType = t.entity<Article>(
  "@pschiffmann/kragle-demo::Article"
);

export const ArticleLibrary = new LibrarySchema(
  "@pschiffmann/kragle-demo::Article",
  {
    getId: t.function(articleType)(t.string()),
    getName: t.function(articleType)(t.string()),
    getFormattedPrice: t.function(articleType)(t.string()),
    parseFormattedPrice: t.function(t.string())(t.number()),
  }
);

export type ArticleLibraryMembers = InferLibraryMembers<typeof ArticleLibrary>;
