#!/usr/bin/env node

import { createPackage } from "./create-package.js";

const description = `
Usage: create-initiative app <path> [package-name]
       create-initiative lib <path> [package-name]

Commands:
  app       Create a new app package at <path>. Use this template if you're
            building a frontend app with the InitiativeJS framework.
  lib       Create a new library package at <path>. Use this template if you're
            building reusable InitiativeJS components for use in other packages.

Options:
  --help    Show this help and exit.

Documentation can be found at
https://github.com/pschiffmann/initiative/tree/main/doc.
`.trim();

async function main(args: readonly string[]) {
  try {
    switch (true) {
      case args[0] === "app" && args.length >= 2 && args.length <= 3: {
        const path = args[1] ?? "my-app";
        const packageName = args[2] ?? "my-app";
        await createPackage("app", path, packageName);
        console.log(`Project template files have been copied to "${path}".`);
        console.log(`Next steps:`);
        console.log("");
        console.log(`  cd ${path}`);
        console.log("  npm install");
        console.log("  npm run dev");
        console.log("");
        console.log("If you encounter any errors, feel free to reach out:");
        console.log("https://github.com/pschiffmann/initiative/issues/new");
        break;
      }

      case args[0] === "lib" && args.length >= 2 && args.length <= 3:
        throw new Error("TODO: This command is not implemented yet.");

      case args[0] === "--help" && args.length === 1:
        console.log(description);
        break;

      default:
        throw new Error(description);
    }
  } catch (e) {
    console.error(e instanceof Error ? e.message : `${e}`);
    process.exit(1);
  }
}

main(process.argv.slice(2));
