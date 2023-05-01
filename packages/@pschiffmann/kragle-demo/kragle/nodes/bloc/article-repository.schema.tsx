import { InferProps, NodeSchema, t } from "@kragle/runtime";

export const ArticleRepositorySchema = new NodeSchema(
  "@pschiffmann/kragle-demo/ArticleRepository",
  {
    outputs: {
      articles: t.array(t.any()),
      getArticleId: t.function(t.any())(t.string()),
      getArticleName: t.function(t.any())(t.string()),
      getArticlePrice: t.function(t.any())(t.string()),
      updateArticle: t.function(t.any())(),
    },
    slots: {
      child: {},
    },
  }
);

export type ArticleRepositoryProps = InferProps<typeof ArticleRepositorySchema>;
