export type Rarity = "common" | "uncommon" | "rare";

// export type Quality = "⭐" | "⭐⭐" | "⭐⭐⭐";

export interface Item {
  // readonly id: string;
  readonly name: string;
  readonly icon: string;
  readonly flavorText: string;
  readonly rarity: Rarity;
  readonly isQuestItem?: boolean;
  readonly value: number;
  readonly maxStackSize: number;
}

export interface ItemStack {
  readonly item: Item;
  readonly size: number;
  // readonly quality: Quality;
}

export class Inventory {
  constructor(
    readonly slots: number,
    readonly gold: number,
    readonly stacks: readonly ItemStack[] = [],
  ) {}

  has(item: Item): boolean {
    return this.stacks.some((stack) => stack.item === item);
  }

  addItem(item: Item): Inventory {
    const index = this.stacks.findIndex(
      (stack) => stack.item === item && stack.size < item.maxStackSize,
    );
    if (index !== -1) {
      const stack = this.stacks[index];
      return new Inventory(
        this.slots,
        this.gold,
        this.stacks.with(index, {
          ...stack,
          size: stack.size + 1,
        }),
      );
    }
    if (this.stacks.length < this.slots) {
      return new Inventory(this.slots, this.gold, [
        ...this.stacks,
        { item, size: 1 },
      ]);
    }
    throw new Error("Inventory is full.");
  }

  removeItem(item: Item): Inventory {
    const index = this.stacks.findIndex((stack) => stack.item === item);
    if (index === -1) {
      throw new Error("Item not in inventory.");
    }
    const stack = this.stacks[index];
    if (stack.size === 1) {
      return new Inventory(
        this.slots,
        this.gold,
        this.stacks.toSpliced(index, 1),
      );
    }
    return new Inventory(
      this.slots,
      this.gold,
      this.stacks.with(index, { ...stack, size: stack.size - 1 }),
    );
  }

  changeGold(delta: number): Inventory {
    if (this.gold + delta < 0) {
      throw new Error("Insufficient gold.");
    }
    return new Inventory(this.slots, this.gold + delta, this.stacks);
  }
}
