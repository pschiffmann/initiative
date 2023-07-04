import { InferLibraryMembers, LibrarySchema, t } from "@kragle/runtime";

export interface Article {
  id: number;
  name: string;
  price: number;
}

export const articleType = t.entity<Article>(
  "@pschiffmann/kragle-demo::Article"
);

export const ArticleLibrarySchema = new LibrarySchema(
  // TODO: Change library name to `@pschiffmann/kragle-demo/Article`, because
  // it allows us to use the `::` separator for library members, like
  // `@pschiffmann/kragle-demo/Article::getId`.
  "@pschiffmann/kragle-demo::Article",
  {
    getId: t.function(articleType)(t.string()),
    getName: t.function(articleType)(t.string()),
    getFormattedPrice: t.function(articleType)(t.string()),
    parseFormattedPrice: t.function(t.string())(t.number()),
  }
);

export type ArticleLibraryMembers = InferLibraryMembers<
  typeof ArticleLibrarySchema
>;
