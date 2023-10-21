import * as muiIcons from "@mui/icons-material";
import fs from "fs";

const filledIconNames = Object.keys(muiIcons).filter(
  (iconName) =>
    iconName !== "default" &&
    iconName !== "__esModule" &&
    !iconName.endsWith("Outlined") &&
    !iconName.endsWith("Rounded") &&
    !iconName.endsWith("Sharp") &&
    !iconName.endsWith("TwoTone"),
);

fs.writeFileSync(
  "./src/libraries/icons-filled.schema.tsx",
  `import { t, InferLibraryMembers, LibrarySchema } from "@initiative.dev/schema";
import { iconType } from "./icon.schema.js";

export const IconsFilledLibrarySchema = new LibrarySchema(
  "@initiative.dev/lib-mui-material::IconsFilled",
  {
${filledIconNames
  .map((icon) => `    ${uncapitalize(icon)}: iconType,`)
  .join("\n")}
  }
);

export type IconsFilledLibraryMembers = InferLibraryMembers<typeof IconsFilledLibrarySchema>;
`,
);

fs.writeFileSync(
  "./src/libraries/icons-filled.tsx",
  `import { IconsFilledLibraryMembers } from "./icons-filled.schema.js";
import {
${filledIconNames.map((icon) => `  ${icon},`).join("\n")}
} from "@mui/icons-material";

${filledIconNames
  .map(
    (icon) =>
      `export const IconsFilledLibrary$${uncapitalize(icon)} = ${icon};`,
  )
  .join("\n")}
`,
);

function uncapitalize(s: string): string {
  return s.length === 0 ? s : s[0].toLowerCase() + s.substring(1);
}
