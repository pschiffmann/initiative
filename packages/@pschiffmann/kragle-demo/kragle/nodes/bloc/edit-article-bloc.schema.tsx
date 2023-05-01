import { InferProps, NodeSchema, t } from "@kragle/runtime";

export const EditArticleBlocSchema = new NodeSchema(
  "@pschiffmann/kragle-demo/EditArticleBloc",
  {
    inputs: {
      article: t.any(),
      updateArticle: t.function(t.any())(),
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
