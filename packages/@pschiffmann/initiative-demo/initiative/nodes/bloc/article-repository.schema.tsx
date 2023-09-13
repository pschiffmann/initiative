import { NodeSchema, t, trimDocText } from "@initiativejs/schema";
import { articleType } from "../../libraries/article.schema.js";

export const ArticleRepositorySchema = new NodeSchema(
  "@pschiffmann/initiative-demo::ArticleRepository",
  {
    outputs: {
      articles: {
        type: t.array(articleType()),
      },
      updateArticle: {
        type: t.function(articleType())()(),
        doc: trimDocText(
          `Searches for an existing article with the same 'article.id' and
           replaces it with 'article'.

           ## Parameters

           - article: Article | The new article data that gets inserted into the
             repository.`,
        ),
      },
    },
    slots: {
      child: {},
    },
  },
);

export type ArticleRepositorySchema = typeof ArticleRepositorySchema;
