import { NodeSchema, t } from "@kragle/runtime";
import { articleType } from "../../libraries/article.schema.js";

export const ArticleRepositorySchema = new NodeSchema(
  "@pschiffmann/kragle-demo::ArticleRepository",
  {
    outputs: {
      articles: {
        type: t.array(articleType),
      },
      updateArticle: {
        type: t.function(articleType)(),
      },
    },
    slots: {
      child: {},
    },
  }
);

export type ArticleRepositorySchema = typeof ArticleRepositorySchema;
