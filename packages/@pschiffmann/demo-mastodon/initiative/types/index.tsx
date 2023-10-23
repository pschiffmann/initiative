import { t } from "@initiative.dev/schema";

/**
 * https://docs.joinmastodon.org/entities/Status/
 */
export interface Status {
  readonly id: string;
  readonly uri: string;
  readonly created_at: string;
  readonly account: Account;
  readonly content: string;
}

/**
 * https://docs.joinmastodon.org/entities/Account/
 */
export interface Account {
  readonly id: string;
  readonly username: string;
  readonly url: string;
  readonly display_name: string;
  readonly avatar: string;
}

export const account = t.entity<Account>(
  "@pschiffmann/demo-mastodon::Account",
  {
    moduleName: "#initiative/types/index.js",
    exportName: "Account",
  },
  () => ({
    properties: {
      id: {
        type: t.string(),
      },
      username: {
        type: t.string(),
      },
      url: {
        type: t.string(),
      },
      display_name: {
        type: t.string(),
      },
      avatar: {
        type: t.string(),
      },
    },
  }),
);

export const status = t.entity<Status>(
  "@pschiffmann/demo-mastodon::Status",
  {
    moduleName: "#initiative/types/index.js",
    exportName: "Status",
  },
  () => ({
    properties: {
      id: {
        type: t.string(),
      },
      uri: {
        type: t.string(),
      },
      created_at: {
        type: t.string(),
      },
      account: {
        type: account(),
      },
      content: {
        type: t.string(),
      },
    },
  }),
);
