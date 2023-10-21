import { t } from "@initiative.dev/schema";

export interface Article {
  id: number;
  name: string;
  price: number;
}

export const article = t.entity<Article>(
  "@pschiffmann/initiative-demo::Article",
  { moduleName: "#initiative/types.js", exportName: "Article" },
  () => ({
    properties: {
      id: {
        type: t.number(),
        doc: `The article id.`,
      },
      name: {
        type: t.string(),
        doc: `The article name.`,
      },
      price: {
        type: t.number(),
        doc: `The article price is Euro Cents.`,
      },
    },
  }),
);
