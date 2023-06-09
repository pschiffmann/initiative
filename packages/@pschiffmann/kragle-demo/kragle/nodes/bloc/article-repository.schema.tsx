import { t } from "@kragle/runtime";
import { InferProps, NodeSchema } from "@kragle/runtime/v2";
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
