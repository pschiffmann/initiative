import { InferProps, NodeSchema, t } from "@kragle/runtime";
import { articleType } from "../../libraries/article.schema.js";

export const ArticleRepositorySchema = new NodeSchema(
  "@pschiffmann/kragle-demo::ArticleRepository",
  {
    outputs: {
      articles: t.array(articleType),
      updateArticle: t.function(articleType)(),
    },
    slots: {
      child: {},
    },
  }
);

export type ArticleRepositoryProps = InferProps<typeof ArticleRepositorySchema>;
