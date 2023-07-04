import { InferProps, NodeSchema, t } from "@kragle/runtime";
import { articleType } from "../../libraries/article.schema.js";

export const EditArticleBlocSchema = new NodeSchema(
  "@pschiffmann/kragle-demo::EditArticleBloc",
  {
    inputs: {
      article: articleType,
      updateArticle: t.function(articleType)(),
    },
    outputs: {
      name: t.string(),
      updateName: t.function(t.string())(),
      price: t.string(),
      updatePrice: t.function(t.string())(),
      save: t.function()(),
    },
    slots: {
      child: {},
    },
  }
);

export type EditArticleBlocProps = InferProps<typeof EditArticleBlocSchema>;
