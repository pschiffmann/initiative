import { NodeSchema, t } from "@initiative.dev/schema";
import { article } from "../../types.js";

export const EditArticleBlocSchema = new NodeSchema(
  "@pschiffmann/initiative-demo::EditArticleBloc",
  {
    inputs: {
      article: {
        type: article(),
      },
      updateArticle: {
        type: t.function(article())()(),
      },
    },
    outputs: {
      name: {
        type: t.string(),
      },
      updateName: {
        type: t.function(t.string())()(),
      },
      price: {
        type: t.string(),
      },
      updatePrice: {
        type: t.function(t.string())()(),
      },
      save: {
        type: t.function()()(),
      },
    },
    slots: {
      child: {},
    },
    editor: {
      // color: "#ed143d",
      icon: "edit_document",
    },
  },
);

export type EditArticleBlocSchema = typeof EditArticleBlocSchema;
