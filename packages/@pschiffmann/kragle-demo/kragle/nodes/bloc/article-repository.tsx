import { useCallback, useState } from "react";
import { ArticleRepositoryProps } from "./article-repository.schema.js";

export function ArticleRepository({
  slots,
  OutputsProvider,
}: ArticleRepositoryProps) {
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
    <OutputsProvider
      articles={articles}
      getArticleId={getArticleId}
      getArticleName={getArticleName}
      getArticlePrice={formatArticlePrice}
      updateArticle={updateArticle}
    >
      {slots.child.element()}
    </OutputsProvider>
  );
}

export interface Article {
  id: number;
  name: string;
  price: number;
}

function getArticleId(article: Article): string {
  return `${article.id}`;
}

function getArticleName(article: Article): string {
  return article.name;
}

export function formatArticlePrice(article: Article): string {
  const euros = Math.trunc(article.price / 100);
  const cents = Math.trunc(article.price % 100);
  return `${euros},${cents.toString().padEnd(2, "0")}€`;
}

export function parseArticlePrice(input: string): number {
  const match = input.match(articlePriceFormat);
  if (!match) throw new Error(`Invalid price format.`);
  return Number.parseInt(match[1]) * 100 + Number.parseInt(match[2]);
}

const articlePriceFormat = /^(\d+),|(d{2})€$/;

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
