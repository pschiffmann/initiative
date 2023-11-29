import { t } from "@initiative.dev/schema";
import {
  AdventureState,
  Hero,
  Inventory,
  Item,
  ItemStack,
} from "../../src/simulation/index.js";

export type {
  AdventureState,
  Hero,
  Inventory,
} from "../../src/simulation/index.js";

export const hero = t.entity<Hero>(
  "@pschiffmann/inventory-game::Hero",
  {
    moduleName: "#initiative/types/index.js",
    exportName: "Hero",
  },
  () => ({
    properties: {
      name: {
        type: t.string(),
      },
      inventory: {
        type: inventory(),
      },
      adventureState: {
        type: adventureState(),
      },
    },
  }),
);

export const adventureState = t.entity<AdventureState>(
  "@pschiffmann/inventory-game::AdventureState",
  {
    moduleName: "#initiative/types/index.js",
    exportName: "AdventureState",
  },
  () => ({
    properties: {
      eventLog: {
        type: t.array(t.string()),
      },
    },
  }),
);

export const inventory = t.entity<Inventory>(
  "@pschiffmann/inventory-game::Inventory",
  {
    moduleName: "#initiative/types/index.js",
    exportName: "Inventory",
  },
  () => ({
    properties: {
      gold: {
        type: t.number(),
      },
      slots: {
        type: t.number(),
      },
      stacks: {
        type: t.array(itemStack()),
      },
    },
  }),
);

export const itemStack = t.entity<ItemStack>(
  "@pschiffmann/inventory-game::ItemStack",
  {
    moduleName: "#initiative/types/index.js",
    exportName: "ItemStack",
  },
  () => ({
    properties: {
      item: {
        type: item(),
      },
      size: {
        type: t.number(),
      },
    },
  }),
);

export const item = t.entity<Item>(
  "@pschiffmann/inventory-game::Item",
  {
    moduleName: "#initiative/types/index.js",
    exportName: "Item",
  },
  () => ({
    properties: {
      name: {
        type: t.string(),
      },
      icon: {
        type: t.string(),
      },
      flavorText: {
        type: t.string(),
      },
      rarity: {
        type: t.union(
          t.string("common"),
          t.string("uncommon"),
          t.string("rare"),
        ),
      },
      isQuestItem: {
        type: t.boolean(),
      },
      value: {
        type: t.number(),
      },
      maxStackSize: {
        type: t.number(),
      },
    },
  }),
);
