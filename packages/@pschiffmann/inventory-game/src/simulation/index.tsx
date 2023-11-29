import {
  AdventureState,
  advanceFromEncounter,
  getEncounterDuration,
} from "./encounters.js";
import { locations } from "./game-data.js";
import { Inventory } from "./items.js";

export type { AdventureState } from "./encounters.js";
export type { Inventory, Item, ItemStack } from "./items.js";

export class Simulation {
  #heroes: readonly Hero[] = [new Hero("Philipp the Mighty")];

  get heroes(): readonly Hero[] {
    return this.#heroes;
  }

  observer: (() => void) | null = null;

  //
  // Game loop scheduling
  //

  #intervalId: number | null = null;

  start() {
    if (this.#intervalId !== null) {
      throw new Error("Simulation is already running.");
    }
    this.#intervalId = window.setInterval(
      () => this.#update(),
      25, // 1000
    );
  }

  stop() {
    if (this.#intervalId === null) {
      throw new Error("Simulation is not running.");
    }
    window.clearInterval(this.#intervalId);
    this.#intervalId = null;
  }

  #update() {
    for (const hero of this.#heroes) {
      hero.update();
    }
    this.#heroes = [...this.#heroes];
    this.observer?.();
  }
}

export class Hero {
  constructor(readonly name: string) {}

  #inventory = new Inventory(12, 10);

  get inventory(): Inventory {
    return this.#inventory;
  }

  #adventureState: AdventureState = {
    location: locations.town,
    encounterId: "$start",
    ticksSinceLeavingTown: 0,
    ticksInLocation: 0,
    remainingTicksInEncounter: 1,
    counters: {},
    eventLog: [
      `Welcome, hero! This is the start of your adventure. Prepare yourself ` +
        `while you are in town, then head out in search of loot and glory!`,
    ],
  };

  get adventureState(): AdventureState {
    return this.#adventureState;
  }

  update() {
    let newLocation = false;
    let newEncounter = false;
    if (this.#adventureState.remainingTicksInEncounter === 0) {
      const oldAdventureState = this.#adventureState;
      ({ adventureState: this.#adventureState, inventory: this.#inventory } =
        advanceFromEncounter(this.#adventureState, this.#inventory));
      if (oldAdventureState.location !== this.#adventureState.location) {
        newLocation = newEncounter = true;
      } else if (
        oldAdventureState.encounterId !== this.#adventureState.encounterId
      ) {
        newEncounter = true;
      }
    }

    const {
      location,
      ticksSinceLeavingTown,
      ticksInLocation,
      remainingTicksInEncounter,
    } = this.#adventureState;
    this.#adventureState = {
      ...this.#adventureState,
      ticksSinceLeavingTown: location.isTown ? 0 : ticksSinceLeavingTown + 1,
      ticksInLocation: newLocation ? 0 : ticksInLocation + 1,
      remainingTicksInEncounter: newEncounter
        ? getEncounterDuration(this.#adventureState)
        : remainingTicksInEncounter - 1,
    };
  }
}
