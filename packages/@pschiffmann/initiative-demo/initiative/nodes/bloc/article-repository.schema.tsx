import { NodeSchema, t, trimDocText } from "@initiative.dev/schema";
import { article } from "../../types.js";

export const ArticleRepositorySchema = new NodeSchema(
  "@pschiffmann/initiative-demo::ArticleRepository",
  {
    outputs: {
      articles: {
        type: t.array(article()),
      },
      updateArticle: {
        type: t.function(article())()(),
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
    editor: {
      // color: "#ed143d",
      icon: "database",
    },
  },
);

export type ArticleRepositorySchema = typeof ArticleRepositorySchema;
