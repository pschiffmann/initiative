import { ObjectMap } from "@pschiffmann/std/object-map";
import { Location } from "./encounters.js";
import { Item } from "./items.js";

function indexBy<T, K extends keyof T>(
  key: K,
  items: readonly T[],
): ObjectMap<T> {
  return Object.fromEntries(items.map((item) => [item[key], item]));
}

export const items = indexBy<Item, "icon">("icon", [
  {
    name: "Fish",
    icon: "🐟",
    flavorText:
      "There are plenty of fish in the sea. But this one is in your bag.",
    rarity: "common",
    value: 10,
    maxStackSize: 10,
  },
  {
    name: "Whale",
    icon: "🐳",
    flavorText:
      "I once caught a fish that was soooo big! -- Well, actually, that's not a fish.",
    rarity: "rare",
    value: 100,
    maxStackSize: 1,
  },
  {
    name: "Fish",
    icon: "🐠",
    flavorText:
      'This is not a generic fish. But I am no fish expert, so I call it "fish".',
    rarity: "common",
    value: 10,
    maxStackSize: 10,
  },
  {
    name: "Puffer Fish",
    icon: "🐡",
    flavorText: "All fish are beautiful.",
    rarity: "uncommon",
    value: 30,
    maxStackSize: 10,
  },
  {
    name: "Angry Fish",
    icon: "🦈",
    flavorText:
      "Careful, this one likes to bite! Was it a good idea to put it in your bag?",
    rarity: "uncommon",
    value: 40,
    maxStackSize: 10,
  },
  {
    name: "Octopus",
    icon: "🐙",
    flavorText: "He wants a hug. 🥺",
    rarity: "rare",
    value: 80,
    maxStackSize: 5,
  },
  {
    name: "Crab",
    icon: "🦀",
    flavorText:
      "If it swims like a fish, and talks like a fish, then it must be a fish.",
    rarity: "common",
    value: 20,
    maxStackSize: 10,
  },
  {
    name: "Bug",
    icon: "🐛",
    flavorText: "Ewww. Why did you put that in your pocket?",
    rarity: "common",
    value: 1,
    maxStackSize: 10,
  },
  {
    name: "Ladybug",
    icon: "🐞",
    flavorText:
      "This one is kinda cute. But still, why did you put that in your pocket?",
    rarity: "uncommon",
    value: 2,
    maxStackSize: 10,
  },
  {
    name: "Spider",
    icon: "🕷️",
    flavorText: "Common house spiders lay up to 250 eggs per season.",
    rarity: "common",
    value: 5,
    maxStackSize: 20,
  },
  {
    name: "Cobweb",
    icon: "🕸️",
    flavorText: "Used as an ingredient for certain alchemical concoctions.",
    rarity: "common",
    value: 4,
    maxStackSize: 20,
  },
  {
    name: "Rock",
    icon: "🪨",
    flavorText: "A rock.",
    rarity: "common",
    value: 5,
    maxStackSize: 10,
  },
  {
    name: "Wood",
    icon: "🪵",
    flavorText: "A log of wood.",
    rarity: "common",
    value: 5,
    maxStackSize: 20,
  },
  {
    name: "Feather",
    icon: "🪶",
    flavorText:
      "Allow you to fly, if you collect enough of them. And if you are a bird.",
    rarity: "common",
    value: 5,
    maxStackSize: 20,
  },
  {
    name: "Mushroom",
    icon: "🍄",
    flavorText: "Delicious or poisonous? Only one way to find out.",
    rarity: "uncommon",
    value: 15,
    maxStackSize: 10,
  },
  {
    name: "Leaf",
    icon: "🍁",
    flavorText: "The usefulness of this item is questionable.",
    rarity: "common",
    value: 1,
    maxStackSize: 20,
  },
  {
    name: "Leaf",
    icon: "🍂",
    flavorText: "The usefulness of this item is questionable.",
    rarity: "common",
    value: 1,
    maxStackSize: 20,
  },
  {
    name: "Herbs",
    icon: "🌿",
    flavorText: "Used as a cooking ingredient.",
    rarity: "uncommon",
    value: 20,
    maxStackSize: 10,
  },
  {
    name: "Rice",
    icon: "🌾",
    flavorText: "Feeds a family of 1. Ideal for lonely adventurers.",
    rarity: "common",
    value: 10,
    maxStackSize: 20,
  },
  {
    name: "Water",
    icon: "💧",
    flavorText: "Replenishes mana. Also used for cooking.",
    rarity: "common",
    value: 2,
    maxStackSize: 20,
  },
  {
    name: "Egg",
    icon: "🥚",
    flavorText: "Used as a cooking ingredient.",
    rarity: "common",
    value: 5,
    maxStackSize: 20,
  },
  {
    name: "Lively egg",
    icon: "🐣",
    flavorText: "Hatches into an animal companion with time.",
    rarity: "rare",
    value: 50,
    maxStackSize: 1,
  },
  {
    name: "Book",
    icon: "📙",
    flavorText: "Read to gain +1 widsom.",
    rarity: "uncommon",
    value: 30,
    maxStackSize: 2,
  },
  {
    name: "Book",
    icon: "📕",
    flavorText: "Read to gain +1 widsom.",
    rarity: "uncommon",
    value: 30,
    maxStackSize: 2,
  },
  {
    name: "Book",
    icon: "📘",
    flavorText: "Read to gain +1 widsom.",
    rarity: "uncommon",
    value: 30,
    maxStackSize: 2,
  },
  {
    name: "Book",
    icon: "📗",
    flavorText: "Read to gain +1 widsom.",
    rarity: "uncommon",
    value: 30,
    maxStackSize: 2,
  },
  {
    name: "Sword",
    icon: "⚔️",
    flavorText: "A must-have for brave heroes.",
    rarity: "uncommon",
    value: 50,
    maxStackSize: 1,
  },
  {
    name: "Dagger",
    icon: "🗡️",
    flavorText: "A must-have for opportunistic individuals.",
    rarity: "uncommon",
    value: 30,
    maxStackSize: 1,
  },
  {
    name: "Bow",
    icon: "🏹",
    flavorText: "A must-have for heroes in tights.",
    rarity: "uncommon",
    value: 40,
    maxStackSize: 1,
  },
  {
    name: "Shield",
    icon: "🛡",
    flavorText: "A must-have for heroes without health insurance.",
    rarity: "uncommon",
    value: 20,
    maxStackSize: 1,
  },
  {
    name: "Enchanted rocking horse",
    icon: "🐴",
    flavorText: "Grants +10% movement speed.",
    rarity: "rare",
    value: 90,
    maxStackSize: 1,
  },
  {
    name: "Red Apple",
    icon: "🍎",
    flavorText: "It's important to keep your apples sorted by color.",
    rarity: "common",
    value: 4,
    maxStackSize: 10,
  },
  {
    name: "Green Apple",
    icon: "🍏",
    flavorText: "It's important to keep your apples sorted by color.",
    rarity: "common",
    value: 4,
    maxStackSize: 10,
  },
  {
    name: "Ancient coin",
    icon: "🪙",
    flavorText: "An ancient coin from a long forgotten civilization.",
    rarity: "rare",
    value: 0,
    maxStackSize: 100,
  },
  {
    name: "Bone",
    icon: "🦴",
    flavorText:
      "Not exactly rare. Most living things carry around hundreds of them.",
    rarity: "common",
    value: 1,
    maxStackSize: 20,
  },
  {
    name: "Skull",
    icon: "💀",
    flavorText: "This one is in mint condition.",
    rarity: "uncommon",
    value: 20,
    maxStackSize: 5,
  },
  {
    name: "Tooth",
    icon: "🦷",
    flavorText: "Maybe an alchemist will buy this?",
    rarity: "common",
    value: 10,
    maxStackSize: 20,
  },
  {
    name: "Meat",
    icon: "🍖",
    flavorText: "Bon appetit.",
    rarity: "common",
    value: 10,
    maxStackSize: 5,
  },
  {
    name: "Prime Meat",
    icon: "🥩",
    flavorText: "Yummy!",
    rarity: "uncommon",
    value: 15,
    maxStackSize: 5,
  },
  {
    name: "Bacon",
    icon: "🥓",
    flavorText: "Restores 5 sanity.",
    rarity: "common",
    value: 10,
    maxStackSize: 20,
  },
  {
    name: "Fishing Flag",
    icon: "🎏",
    flavorText:
      "While fishing, attracts fellow fishing enthusiasts to join you.",
    rarity: "rare",
    value: 200,
    maxStackSize: 1,
  },
  {
    name: "Sandwich",
    icon: "🥪",
    flavorText: "Restores 50 health over 30 seconds.",
    rarity: "common",
    value: 10,
    maxStackSize: 20,
  },
  {
    name: "Key",
    icon: "🔑",
    flavorText: "This will surely open something.",
    rarity: "uncommon",
    value: 1,
    maxStackSize: 5,
  },
  {
    name: "Key",
    icon: "🗝️",
    flavorText: "This will surely open something.",
    rarity: "uncommon",
    value: 1,
    maxStackSize: 5,
  },
  {
    name: "Bandage",
    icon: "🩹",
    flavorText: 'Removes the "Bleeding" status on use.',
    rarity: "common",
    value: 5,
    maxStackSize: 10,
  },
  {
    name: "Letter to Fred",
    icon: "💌",
    flavorText: "Must be delivered to Fred post-haste!",
    rarity: "common",
    isQuestItem: true,
    value: 0,
    maxStackSize: 1,
  },
  {
    name: "Letter to Gisela",
    icon: "📧",
    flavorText: "Deliver to Gisela. You find her store in the market district.",
    rarity: "common",
    isQuestItem: true,
    value: 0,
    maxStackSize: 1,
  },
  {
    name: "Letter to Arthur",
    icon: "📜",
    flavorText:
      "Deliver to Arthur. He lives in the old light house down at the beach.",
    rarity: "common",
    isQuestItem: true,
    value: 0,
    maxStackSize: 1,
  },
  {
    name: "Empty Bottle",
    icon: "🍾",
    flavorText: "Definitely not half empty.",
    rarity: "common",
    value: 10,
    maxStackSize: 5,
  },
  {
    name: "Axe",
    icon: "🪓",
    flavorText: "Allows you to chop trees.",
    rarity: "common",
    value: 50,
    maxStackSize: 1,
  },

  {
    name: "Fishing Rod",
    icon: "🎣",
    flavorText: "Allows you to catch fish.",
    rarity: "common",
    value: 50,
    maxStackSize: 1,
  },
]);

export const locations = indexBy<Location, "id">("id", [
  {
    id: "town",
    isTown: true,
    encounters: {
      $start: {
        message: "You arrive in town.",
        duration: 1,
        transitions: {
          marketSquare: 1,
        },
      },
      marketSquare: {
        duration: {
          min: 60 * 0.5,
          max: 60,
        },
        transitions: {
          bored: 1,
          tavern: 5,
          smithy: 5,
          adventurersGuild: 5,
          event_findGarbage: 1,
          event_kickDog: 1,
          event_deliverMail1: 1,
          event_deliverMail2: 1,
          event_deliverMail3: 1,
          gates: 10,
        },
      },
      bored: {
        message: "You are bored. You wander around aimlessly.",
        duration: 60 * 2,
        transitions: {
          marketSquare: 1,
        },
      },
      tavern: {
        guards: [
          {
            type: "max-location-duration",
            ticks: 60 * 30,
          },
          {
            type: "max-counter-value",
            counterId: "visit-tavern",
            value: 0,
          },
        ],
        message: "You enter the tavern.",
        duration: {
          min: 60,
          max: 60 * 3,
        },
        transitions: {
          tavern_drink: 1,
          tavern_gamble: 1,
          tavern_rest: 2,
        },
      },
      tavern_drink: {
        message:
          "You sit down at the bar and order an ice cold milk. Makes strong bones, y'know.",
        duration: {
          min: 60 * 2,
          max: 60 * 4,
        },
        transitions: {
          tavern_rest: 1,
        },
      },
      tavern_gamble: {
        guards: [
          {
            type: "consume-currency",
            amount: 30,
          },
        ],
        message:
          "You sit down with a group of respectable gentlemen for a game of dice.",
        duration: {
          min: 60 * 3,
          max: 50 * 5,
        },
        transitions: {
          tavern_gamble_loss: 3,
          tavern_gamble_win: 1,
        },
      },
      tavern_gamble_loss: {
        message:
          "Today is not your lucky day. You lost your stake. Well, there's always a next time.",
        duration: 30,
        transitions: {
          tavern_rest: 1,
        },
      },
      tavern_gamble_win: {
        message: "Lady luck is on your side today!",
        actions: [
          {
            type: "loot-gold",
            amount: {
              min: 90,
              max: 150,
            },
          },
        ],
        duration: 30,
        transitions: {
          tavern_rest: 1,
        },
      },
      tavern_rest: {
        message: "You rent a bed for the night.",
        duration: 60 * 15,
        transitions: {
          tavern_rested: 1,
        },
      },
      tavern_rested: {
        message: "You wake up feeling good. You receive status: Well rested",
        duration: 30,
        transitions: {
          marketSquare: 1,
        },
      },
      smithy: {
        guards: [
          {
            type: "max-location-duration",
            ticks: 60 * 30,
          },
          {
            type: "max-counter-value",
            counterId: "visit-smithy",
            value: 0,
          },
        ],
        message: "You enter the smithy.",
        duration: 60,
        transitions: {
          smithy_examineWares: 3,
          smithy_flirt1: 1,
        },
      },
      smithy_examineWares: {
        message: "You examine the wares.",
        duration: {
          min: 60 * 2,
          max: 60 * 5,
        },
        transitions: {
          smithy_buyNothing: 9,
          smithy_buySomething: 1,
        },
      },
      smithy_buyNothing: {
        message: "Nothing catches your eye.",
        duration: 30,
        transitions: {
          smithy_leave: 1,
        },
      },
      smithy_buySomething: {
        guards: [
          {
            type: "consume-currency",
            amount: 30,
          },
          {
            type: "free-inventory-slots",
            slots: 1,
          },
        ],
        message:
          "A fine piece catches your eye. You have terrible impulse control. " +
          "You buy it without haggling.",
        actions: [
          {
            type: "loot-item",
            lootTable: {
              "⚔️": 1,
              "🛡️": 1,
              "🗡️": 1,
            },
          },
        ],
        duration: 60,
        transitions: {
          smithy_leave: 1,
        },
      },
      smithy_flirt1: {
        message:
          "The blacksmith apprentice catches your eye. You flirt with him: " +
          '"Hey, is it just me, or is it getting hot in here?"',
        duration: 30,
        transitions: {
          smithy_flirt2: 1,
        },
      },
      smithy_flirt2: {
        message:
          "The apprentice starts hammering on a piece of steel, " +
          "to drown out your voice.",
        duration: 30,
        transitions: {
          smithy_leave: 1,
        },
      },
      smithy_leave: {
        message: "You leave the smithy.",
        duration: 1,
        transitions: {
          marketSquare: 1,
        },
      },
      adventurersGuild: {
        guards: [
          {
            type: "max-location-duration",
            ticks: 60 * 30,
          },
          {
            type: "max-counter-value",
            counterId: "visit-adventurers-guild",
            value: 0,
          },
        ],
        message: "You enter the adventurers guild hall.",
        duration: 60 * 3,
        transitions: {
          adventurersGuild_donateBandages: 1,
          adventurersGuild_questKillGoblins: 1,
          adventurersGuild_questKillSkeletons: 1,
          adventurersGuild_questFetchWolfTeeth: 1,
          adventurersGuild_questExploreRuins: 1,
          adventurersGuild_questDeliverMail: 1,
        },
      },
      adventurersGuild_donateBandages: {
        guards: [
          {
            type: "consume-item",
            itemId: "🩹",
          },
        ],
        message:
          'You donate some bandages to the "young talent equipment fund". ' +
          'Your reputation with "Adventurers Guild" increases by 1.',
        duration: 60,
        transitions: {
          adventurersGuild_leave: 1,
        },
      },
      adventurersGuild_questKillGoblins: {
        message: "You accept a quest to kill 12 goblins.",
        duration: 60,
        transitions: {
          adventurersGuild_leave: 1,
        },
      },
      adventurersGuild_questKillSkeletons: {
        message: "You accept a quest to kill 8 skeletons.",
        duration: 60,
        transitions: {
          adventurersGuild_leave: 1,
        },
      },
      adventurersGuild_questFetchWolfTeeth: {
        message: "You accept a quest to fetch 42 wolf teeth.",
        duration: 60,
        transitions: {
          adventurersGuild_leave: 1,
        },
      },
      adventurersGuild_questExploreRuins: {
        message: "You accept a quest to explore some cursed ruins.",
        duration: 60,
        transitions: {
          adventurersGuild_leave: 1,
        },
      },
      adventurersGuild_questDeliverMail: {
        guards: [
          {
            type: "free-inventory-slots",
            slots: 3,
          },
          {
            type: "not-possess-item",
            itemId: "💌",
          },
          {
            type: "not-possess-item",
            itemId: "📧",
          },
          {
            type: "not-possess-item",
            itemId: "📜",
          },
        ],
        message: "You accept a quest to deliver some mail.",
        actions: [
          {
            type: "loot-item",
            lootTable: {
              "💌": 1,
            },
          },
          {
            type: "loot-item",
            lootTable: {
              "📧": 1,
            },
          },
          {
            type: "loot-item",
            lootTable: {
              "📜": 1,
            },
          },
        ],
        duration: 60,
        transitions: {
          adventurersGuild_leave: 1,
        },
      },
      adventurersGuild_leave: {
        message: "You leave the adventurers guild hall.",
        duration: 1,
        transitions: {
          marketSquare: 1,
        },
      },
      event_findGarbage: {
        guards: [
          {
            type: "max-location-duration",
            ticks: 60 * 30,
          },
          {
            type: "max-counter-value",
            counterId: "events",
            value: 1,
          },
        ],
        message:
          "You find something just lying around on the street. " +
          "Well, now it's yours.",
        actions: [
          {
            type: "loot-item",
            lootTable: {
              "🐛": 3,
              "🐞": 3,
              "🕷️": 3,
              "🪨": 3,
              "🪶": 3,
              "🍁": 3,
              "🍂": 3,
              "📙": 1,
              "📕": 1,
              "📘": 1,
              "📗": 1,
              "🍎": 3,
              "🍏": 3,
              "🪙": 1,
              "🦷": 1,
              "🥪": 3,
              "🍾": 3,
            },
          },
        ],
        duration: 60,
        transitions: {
          marketSquare: 1,
        },
      },
      event_kickDog: {
        message: "You kick a stray dog. You receive status: Cursed",
        duration: 60,
        transitions: {
          marketSquare: 1,
        },
      },
      event_deliverMail1: {
        guards: [
          {
            type: "max-counter-value",
            counterId: "events",
            value: 1,
          },
          {
            type: "consume-item",
            itemId: "💌",
          },
        ],
        message:
          "You run into Fred by chance. You remember you have a letter for him.",
        duration: 60 * 2,
        transitions: {
          marketSquare: 1,
        },
      },
      event_deliverMail2: {
        guards: [
          {
            type: "max-counter-value",
            counterId: "events",
            value: 1,
          },
          {
            type: "consume-item",
            itemId: "📧",
          },
        ],
        message: "You come by Giselas store. You deliver her letter.",
        duration: 60 * 3,
        transitions: {
          marketSquare: 1,
        },
      },
      event_deliverMail3: {
        guards: [
          {
            type: "max-counter-value",
            counterId: "events",
            value: 1,
          },
          {
            type: "consume-item",
            itemId: "📜",
          },
        ],
        message:
          "You never liked Arthur anyways. You toss his letter into the canal.",
        duration: 60,
        transitions: {
          marketSquare: 1,
        },
      },
      gates: {
        guards: [
          {
            type: "min-location-duration",
            ticks: 60 * 30,
          },
        ],
        message: "You pack your equipment and head out for adventure.",
        duration: 60 * 2,
        transitions: {
          "location:forest": 1,
        },
      },
    },
  },

  {
    id: "forest",
    encounters: {
      $start: {
        message: "You enter the forest.",
        duration: 1,
        transitions: {
          exploring: 1,
        },
      },
      exploring: {
        duration: 60,
        transitions: {
          pickUpStuff: 15,
          chopTree: 10,
          rest: 10,
          fightGoblin: 2,
          fightSkeleton: 2,
          fightWolf: 2,
          fightBoar: 2,
          fightBear: 2,
          "location:lake": 2,
          findCave: 1,
          findRuins: 1,
          findChest: 1,
          leave: 50,
        },
      },
      pickUpStuff: {
        message: "You find something lying on the ground.",
        duration: 60 * 0.5,
        actions: [
          {
            type: "loot-item",
            lootTable: {
              "🐛": 5,
              "🐞": 3,
              "🕷️": 2,
              "🕸️": 5,
              "🪶": 5,
              "🍁": 10,
              "🍂": 10,
              "🍎": 10,
              "🍏": 10,
              "🪙": 1,
              "🦷": 1,
              "🪨": 10,
              "🪵": 10,
              "🍄": 5,
              "🌿": 3,
              "🌾": 2,
              "💧": 5,
              "🥚": 1,
            },
          },
        ],
        transitions: {
          exploring: 1,
        },
      },
      chopTree: {
        message: "You find a tree.",
        duration: 60 * 0.5,
        transitions: {
          chopTree_success: 1,
          chopTree_failure: 1,
        },
      },
      chopTree_success: {
        guards: [
          {
            type: "possess-item",
            itemId: "🪓",
          },
        ],
        message: "You chop down the tree.",
        duration: 60 * 4,
        actions: [
          {
            type: "loot-item",
            lootTable: {
              "🪵": 1,
            },
          },
          {
            type: "loot-item",
            lootTable: {
              "🪵": 1,
            },
          },
          {
            type: "loot-item",
            lootTable: {
              "🍁": 10,
              "🍂": 10,
              "🍎": 10,
              "🍏": 10,
              "🪵": 10,
              "🪶": 10,
              "🥚": 10,
              "🐣": 1,
            },
          },
        ],
        transitions: {
          exploring: 1,
        },
      },
      chopTree_failure: {
        guards: [
          {
            type: "not-possess-item",
            itemId: "🪓",
          },
        ],
        message: "You don't have an axe.",
        duration: 60 * 0.5,
        transitions: {
          exploring: 1,
        },
      },
      rest: {
        guards: [
          {
            type: "min-adventure-duration",
            ticks: 60 * 60,
          },
          {
            type: "max-adventure-duration",
            ticks: 60 * 60 * 2,
          },
        ],
        message: "You light a fire and take a rest.",
        duration: 60 * 15,
        transitions: {
          rest_leave: 1,
        },
      },
      rest_leave: {
        message:
          "You feel energized for more adventuring. " +
          "You receive status: Well rested",
        duration: 60 * 0.5,
        transitions: {
          exploring: 1,
        },
      },
      fightGoblin: {
        message: "You encounter a goblin.",
        duration: {
          min: 60,
          max: 60 * 3,
        },
        transitions: {
          fightGoblin_success: 1,
        },
      },
      fightGoblin_success: {
        message: "You defeat the goblin.",
        actions: [
          {
            type: "loot-item",
            lootTable: {
              "🐟": 5,
              "🕷️": 5,
              "🕸️": 5,
              "🪨": 5,
              "🍄": 5,
              "🍁": 5,
              "🥚": 10,
              "🗡️": 1,
              "🪙": 30,
              "🦴": 5,
              "🔑": 1,
              "🗝️": 1,
              "🩹": 20,
            },
          },
        ],
        duration: 60 * 0.5,
        transitions: {
          exploring: 1,
        },
      },
      fightSkeleton: {
        message: "You encounter a skeleton.",
        duration: {
          min: 60,
          max: 60 * 3,
        },
        transitions: {
          fightSkeleton_success: 1,
        },
      },
      fightSkeleton_success: {
        message: "You defeat the skeleton.",
        actions: [
          {
            type: "loot-item",
            lootTable: {
              "🕸️": 10,
              "📕": 5,
              "⚔️": 1,
              "🏹": 1,
              "🪙": 10,
              "🦴": 20,
              "💀": 20,
              "🦷": 5,
              "🔑": 1,
              "🗝️": 1,
            },
          },
        ],
        duration: 60 * 0.5,
        transitions: {
          exploring: 1,
        },
      },
      fightWolf: {
        message: "You encounter a wild wolf.",
        duration: {
          min: 60,
          max: 60 * 3,
        },
        transitions: {
          fightWolf_success: 1,
        },
      },
      fightWolf_success: {
        message: "You defeat the wolf.",
        actions: [
          {
            type: "loot-item",
            lootTable: {
              "🦴": 5,
              "🦷": 10,
              "🍖": 20,
              "🥩": 10,
              "🔑": 1,
              "🗝️": 1,
            },
          },
        ],
        duration: 60 * 0.5,
        transitions: {
          exploring: 1,
        },
      },
      fightBoar: {
        message: "You encounter a wild boar.",
        duration: {
          min: 60,
          max: 60 * 3,
        },
        transitions: {
          fightBoar_success: 1,
        },
      },
      fightBoar_success: {
        message: "You defeat the boar.",
        actions: [
          {
            type: "loot-item",
            lootTable: {
              "🦴": 5,
              "🦷": 5,
              "🍖": 10,
              "🥩": 5,
              "🥓": 20,
              "🔑": 1,
              "🗝️": 1,
            },
          },
        ],
        duration: 60 * 0.5,
        transitions: {
          exploring: 1,
        },
      },
      fightBear: {
        message: "You encounter a bear.",
        duration: {
          min: 60,
          max: 60 * 3,
        },
        transitions: {
          fightBear_success: 1,
        },
      },
      fightBear_success: {
        message: "You defeat the bear.",
        actions: [
          {
            type: "loot-item",
            lootTable: {
              "🦴": 5,
              "🦷": 10,
              "🍖": 20,
              "🥩": 20,
              "🔑": 1,
              "🗝️": 1,
            },
          },
        ],
        duration: 60 * 0.5,
        transitions: {
          exploring: 1,
        },
      },
      findCave: {
        message: "You find a cave. It's too dark to enter without a torch.",
        duration: 60 * 2,
        transitions: {
          exploring: 1,
        },
      },
      findRuins: {
        message:
          "You find some old ruins full of monsters. It would be wise to " +
          "return later, with better equipment.",
        duration: 60 * 2,
        transitions: {
          exploring: 1,
        },
      },
      findChest: {
        message: "You find an old chest.",
        duration: 60 * 0.5,
        transitions: {
          findChest_success: 1,
          findChest_failure: 1,
        },
      },
      findChest_success: {
        guards: [
          {
            type: "consume-item",
            itemId: "🔑",
          },
        ],
        message: "A key from your inventory opens the chest.",
        actions: [
          {
            type: "loot-item",
            lootTable: {
              "🐣": 1,
              "🐴": 1,
              "🎏": 1,
              "🪓": 5,
              "🎣": 5,
            },
          },
          {
            type: "loot-gold",
            amount: {
              min: 250,
              max: 500,
            },
          },
        ],
        duration: 60,
        transitions: {
          exploring: 1,
        },
      },
      findChest_failure: {
        guards: [
          {
            type: "not-possess-item",
            itemId: "🔑",
          },
        ],
        message: "You don't have the key.",
        duration: 60,
        transitions: {
          exploring: 1,
        },
      },
      leave: {
        guards: [
          {
            type: "min-adventure-duration",
            ticks: 60 * 60 * 3,
          },
        ],
        message:
          "You are happy with your achievements for the day. You head home.",
        duration: 60 * 10,
        transitions: {
          "location:town": 1,
        },
      },
    },
  },

  {
    id: "lake",
    encounters: {
      $start: {
        message: "You arrive at a lake.",
        duration: 1,
        transitions: {
          fishing_start: 1,
          fishing_failure: 1,
        },
      },
      fishing_failure: {
        guards: [
          {
            type: "not-possess-item",
            itemId: "🎣",
          },
        ],
        message:
          "You don't have a fishing rod. There is nothing else to do here.",
        duration: 60 * 5,
        transitions: {
          "location:forest": 1,
        },
      },
      fishing_start: {
        guards: [
          {
            type: "possess-item",
            itemId: "🎣",
          },
        ],
        message: "You equip your fishing rod.",
        duration: 1,
        transitions: {
          fishing_inProgress: 1,
        },
      },
      fishing_inProgress: {
        duration: {
          min: 60 * 2,
          max: 60 * 5,
        },
        transitions: {
          fishing_success: 2,
          leave: 1,
        },
      },
      fishing_success: {
        guards: [
          {
            type: "max-counter-value",
            counterId: "fish-caught",
            value: 15,
          },
        ],
        message: "You catch a fish.",
        actions: [
          {
            type: "loot-item",
            lootTable: {
              "🐟": 10,
              "🐳": 1,
              "🐠": 10,
              "🐡": 5,
              "🦈": 5,
              "🐙": 3,
              "🦀": 8,
            },
          },
        ],
        duration: 1,
        transitions: {
          fishing_inProgress: 1,
        },
      },
      leave: {
        guards: [
          {
            type: "min-counter-value",
            counterId: "fish-caught",
            value: 5,
          },
        ],
        message: "You pack up your fishing gear and head back into the forest.",
        duration: 60 * 5,
        transitions: {
          "location:forest": 1,
        },
      },
    },
  },
]);
