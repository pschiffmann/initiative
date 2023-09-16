import { t } from "@initiativejs/schema";

export interface Article {
  id: number;
  name: string;
  price: number;
}

export const articleType = t.entity<Article>(
  "@pschiffmann/initiative-demo::Article",
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
