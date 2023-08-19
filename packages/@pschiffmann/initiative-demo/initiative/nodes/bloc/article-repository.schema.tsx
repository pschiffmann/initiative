import { NodeSchema, t } from "@initiativejs/schema";
import { articleType } from "../../libraries/article.schema.js";

export const ArticleRepositorySchema = new NodeSchema(
  "@pschiffmann/initiative-demo::ArticleRepository",
  {
    outputs: {
      articles: {
        type: t.array(articleType()),
      },
      updateArticle: {
        type: t.function(articleType())(),
      },
    },
    slots: {
      child: {},
    },
  },
);

export type ArticleRepositorySchema = typeof ArticleRepositorySchema;
