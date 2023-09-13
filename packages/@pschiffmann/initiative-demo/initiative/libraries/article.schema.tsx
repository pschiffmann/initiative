import { InferLibraryMembers, LibrarySchema, t } from "@initiativejs/schema";

export interface Article {
  id: number;
  name: string;
  price: number;
}

export const articleType = t.entity<Article>(
  "@pschiffmann/initiative-demo::Article",
  () => ({
    properties: {
      id: {
        type: t.number(),
        doc: `The article id.`,
      },
      name: {
        type: t.string(),
        doc: `The article name.`,
      },
      price: {
        type: t.number(),
        doc: `The article price is Euro Cents.`,
      },
    },
  }),
);

export const ArticleLibrarySchema = new LibrarySchema(
  // TODO: Change library name to `@pschiffmann/initiative-demo/Article`, because
  // it allows us to use the `::` separator for library members, like
  // `@pschiffmann/initiative-demo/Article::getId`.
  "@pschiffmann/initiative-demo::Article",
  {
    getId: t.function(articleType())()(t.string()),
    getName: t.function(articleType())()(t.string()),
    getFormattedPrice: t.function(articleType())()(t.string()),
    parseFormattedPrice: t.function(t.string())()(t.number()),
  },
);

export type ArticleLibraryMembers = InferLibraryMembers<
  typeof ArticleLibrarySchema
>;
