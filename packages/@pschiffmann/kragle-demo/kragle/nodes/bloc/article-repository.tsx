import { NodeComponentProps } from "@kragle/runtime";
import { useCallback, useState } from "react";
import { Article } from "../../libraries/article.schema.js";
import { ArticleRepositorySchema } from "./article-repository.schema.js";

export function ArticleRepository({
  slots,
  OutputsProvider,
}: NodeComponentProps<ArticleRepositorySchema>) {
  const [articles, setArticles] = useState(createArticles);

  const updateArticle = useCallback(
    (newArticle: Article) =>
      setArticles((prev) =>
        prev.map((article) =>
          article.id === newArticle.id ? newArticle : article
        )
      ),
    []
  );

  return (
    <OutputsProvider articles={articles} updateArticle={updateArticle}>
      <slots.child.Component />
    </OutputsProvider>
  );
}

function createArticles(): readonly Article[] {
  return [
    { id: 18947, name: "T-Shirt", price: 1999 },
    { id: 27954, name: "Soft drink", price: 199 },
    { id: 15398, name: "Flower", price: 599 },
    { id: 13986, name: "Horse", price: 89900 },
    { id: 9075, name: "Board game", price: 1299 },
    { id: 13456, name: "Popcorn", price: 350 },
  ];
}
