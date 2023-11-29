import { NodeSchema, t } from "@initiative.dev/schema";
import { itemStack } from "../types/index.js";

export const InventoryListSchema = new NodeSchema(
  "@initiative.dev/inventory-game::InventoryList",
  {
    inputs: {
      items: {
        type: t.array(itemStack()),
      },
    },
  },
);

export type InventoryListSchema = typeof InventoryListSchema;
