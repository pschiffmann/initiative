import * as $Math from "@pschiffmann/std/math";
import { ObjectMap } from "@pschiffmann/std/object-map";
import { items, locations } from "./game-data.js";
import { Inventory, Item } from "./items.js";

export interface Location {
  readonly id: string;

  /**
   * If `true`, the player is allowed to buy/sell items.
   */
  readonly isTown?: boolean;

  /**
   * A finite state machine that determines the heroes actions in this location.
   */
  readonly encounters: {
    readonly $start: Encounter;
    readonly [state: string]: Encounter;
  };
}

export interface Encounter {
  /**
   * All guards must match the current `AdventureState`, or the transition to
   * this encounter can't be taken.
   */
  readonly guards?: readonly EncounterGuard[];

  /**
   * This text is written to the event log when the encounter starts.
   */
  readonly message?: string;

  /**
   * When this state is entered, all actions are executed in sequence.
   */
  readonly actions?: readonly EncounterAction[];

  /**
   * The state is left after this many seconds.
   */
  readonly duration: NumberRange | number;

  /**
   * Map from successor state to relative chance for this transition to be
   * picked. Keys that start with `location:` transition to the specified
   * location.
   */
  readonly transitions: ObjectMap<number>;
}

export type EncounterGuard =
  | {
      /** The hero left town at least this many ticks ago. */
      readonly type: "min-adventure-duration";
      readonly ticks: number;
    }
  | {
      /** The hero left town at most this many ticks ago. */
      readonly type: "max-adventure-duration";
      readonly ticks: number;
    }
  | {
      /** The hero is in this location for at least this many ticks. */
      readonly type: "min-location-duration";
      readonly ticks: number;
    }
  | {
      /** The hero is in this location for at most this many ticks. */
      readonly type: "max-location-duration";
      readonly ticks: number;
    }
  | {
      readonly type: "min-counter-value";
      readonly counterId: string;
      readonly value: number;
    }
  | {
      readonly type: "max-counter-value";
      readonly counterId: string;
      readonly value: number;
    }
  | {
      readonly type: "possess-item";
      readonly itemId: string;
    }
  | {
      readonly type: "not-possess-item";
      readonly itemId: string;
    }
  | {
      readonly type: "consume-item";
      readonly itemId: string;
    }
  | {
      readonly type: "consume-currency";
      readonly amount: number;
    }
  | {
      readonly type: "free-inventory-slots";
      readonly slots: number;
    };

export type EncounterAction =
  | {
      readonly type: "loot-item";

      /**
       * Map from item id to relative drop chance. The item id `NULL` causes no
       * item to be dropped.
       */
      readonly lootTable: ObjectMap<number>;
    }
  | {
      readonly type: "loot-gold";
      readonly amount: number | NumberRange;
    };

export interface NumberRange {
  readonly min: number;
  readonly max: number;
}

export interface LootTableItem {
  readonly item: Item | null;
  readonly dropChance: number;
}

export interface AdventureState {
  readonly location: Location;
  readonly encounterId: string;

  readonly ticksSinceLeavingTown: number;
  readonly ticksInLocation: number;
  readonly remainingTicksInEncounter: number;

  readonly counters: ObjectMap<number>;
  readonly eventLog: readonly string[];
}

function matchGuard(
  guard: EncounterGuard,
  adventureState: AdventureState,
  inventory: Inventory,
): boolean {
  switch (guard.type) {
    case "min-adventure-duration":
      return adventureState.ticksSinceLeavingTown >= guard.ticks;
    case "max-adventure-duration":
      return adventureState.ticksSinceLeavingTown <= guard.ticks;
    case "min-location-duration":
      return adventureState.ticksInLocation >= guard.ticks;
    case "max-location-duration":
      return adventureState.ticksInLocation <= guard.ticks;
    case "min-counter-value":
      return (adventureState.counters[guard.counterId] ?? 0) >= guard.value;
    case "max-counter-value":
      return (adventureState.counters[guard.counterId] ?? 0) <= guard.value;
    case "possess-item":
    case "consume-item":
      return inventory.has(items[guard.itemId]);
    case "not-possess-item":
      return !inventory.has(items[guard.itemId]);
    case "consume-currency":
      return inventory.gold >= guard.amount;
    case "free-inventory-slots":
      return inventory.slots - inventory.stacks.length >= guard.slots;
  }
}

function executeGuard(
  guard: EncounterGuard,
  adventureState: AdventureState,
  inventory: Inventory,
): { adventureState: AdventureState; inventory: Inventory } {
  switch (guard.type) {
    case "min-counter-value":
    case "max-counter-value":
      return {
        adventureState: {
          ...adventureState,
          counters: {
            ...adventureState.counters,
            [guard.counterId]:
              (adventureState.counters[guard.counterId] ?? 0) + 1,
          },
        },
        inventory,
      };
    case "consume-item":
      return {
        adventureState,
        inventory: inventory.removeItem(items[guard.itemId]),
      };
    case "consume-currency":
      return {
        adventureState,
        inventory: inventory.changeGold(-guard.amount),
      };
    default:
      return { adventureState, inventory };
  }
}

function executeAction(
  action: EncounterAction,
  adventureState: AdventureState,
  inventory: Inventory,
): { adventureState: AdventureState; inventory: Inventory } {
  switch (action.type) {
    case "loot-item": {
      const itemIndex = weightedRandomIndex(Object.values(action.lootTable));
      const itemId = Object.keys(action.lootTable)[itemIndex];
      if (itemId === "NULL") return { adventureState, inventory };
      const item = items[itemId];
      try {
        return {
          adventureState: {
            ...adventureState,
            eventLog: [
              ...adventureState.eventLog,
              `You receive loot: ${item.icon} ${item.name}`,
            ],
          },
          inventory: inventory.addItem(item),
        };
      } catch (e) {
        return {
          adventureState: {
            ...adventureState,
            eventLog: [
              ...adventureState.eventLog,
              `You find loot, but leave it behind because your bags are ` +
                `full: ${item.icon} ${item.name}`,
            ],
          },
          inventory,
        };
      }
    }
    case "loot-gold": {
      const amount =
        typeof action.amount === "number"
          ? action.amount
          : $Math.getRandomInt(action.amount.min, action.amount.max);
      return {
        adventureState: {
          ...adventureState,
          eventLog: [...adventureState.eventLog, `You receive ${amount} gold.`],
        },
        inventory: inventory.changeGold(amount),
      };
    }
  }
}

export function advanceFromEncounter(
  adventureState: AdventureState,
  inventory: Inventory,
): { adventureState: AdventureState; inventory: Inventory } {
  let { location, encounterId } = adventureState;
  const current = location.encounters[encounterId];
  const nextIds = Object.keys(current.transitions).filter((encounterId) => {
    if (encounterId.startsWith("location:")) return true;
    const encounter = location.encounters[encounterId];
    const log = encounterId === "tavern";
    return (
      !encounter.guards ||
      encounter.guards.every((guard) =>
        matchGuard(guard, adventureState, inventory),
      )
    );
  });
  if (nextIds.length === 0) {
    throw new Error(
      `Stuck in encounter '${encounterId}' - ` +
        `can't find a valid next encounter.`,
    );
  }
  const nextDistribution = nextIds.map(
    (encounterId) => current.transitions[encounterId],
  );
  let nextId = nextIds[weightedRandomIndex(nextDistribution)];

  if (nextId.startsWith("location:")) {
    location = locations[nextId.substring("location:".length)];
    adventureState = {
      ...adventureState,
      location,
    };
    nextId = "$start";
  }

  adventureState = {
    ...adventureState,
    encounterId: nextId,
  };
  const nextEncounter = location.encounters[nextId];
  if (nextEncounter.message) {
    adventureState = {
      ...adventureState,
      eventLog: [...adventureState.eventLog, nextEncounter.message],
    };
  }
  for (const guard of nextEncounter.guards ?? []) {
    ({ adventureState, inventory } = executeGuard(
      guard,
      adventureState,
      inventory,
    ));
  }
  for (const action of nextEncounter.actions ?? []) {
    ({ adventureState, inventory } = executeAction(
      action,
      adventureState,
      inventory,
    ));
  }

  return { adventureState, inventory };
}

export function getEncounterDuration({
  location,
  encounterId,
}: AdventureState): number {
  const encounter = location.encounters[encounterId];
  return typeof encounter.duration === "number"
    ? encounter.duration
    : $Math.getRandomInt(encounter.duration.min, encounter.duration.max);
}

/**
 * Returns a random index into `weights`, where each element specifies the
 * relative probability of this index being chosen. All elements in `weights`
 * must be non-negative numbers.
 *
 * Example: When calling `weightedRandomIndex([5, 1, 8, 4])`, the chance to get
 * each index is:
 *
 * | Index | Probability |
 * |-------|-------------|
 * | 0     | 5/18 ≈ 28%  |
 * | 1     | 1/18 ≈ 6%   |
 * | 2     | 8/18 ≈ 44%  |
 * | 3     | 4/18 ≈ 22%  |
 */
function weightedRandomIndex(weights: readonly number[]): number {
  const r = Math.random() * $Math.sum(weights as number[]);

  let index = 0;
  for (let sum = weights[0]; index < weights.length; sum += weights[++index]) {
    if (r <= sum) break;
  }
  return index;
}
