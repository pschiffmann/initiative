import { NodeSchema, t } from "@initiativejs/schema";
import { articleType } from "../../libraries/article.schema.js";

export const EditArticleBlocSchema = new NodeSchema(
  "@pschiffmann/initiative-demo::EditArticleBloc",
  {
    inputs: {
      article: {
        type: articleType(),
      },
      updateArticle: {
        type: t.function(articleType())(),
      },
    },
    outputs: {
      name: {
        type: t.string(),
      },
      updateName: {
        type: t.function(t.string())(),
      },
      price: {
        type: t.string(),
      },
      updatePrice: {
        type: t.function(t.string())(),
      },
      save: {
        type: t.function()(),
      },
    },
    slots: {
      child: {},
    },
  },
);

export type EditArticleBlocSchema = typeof EditArticleBlocSchema;
