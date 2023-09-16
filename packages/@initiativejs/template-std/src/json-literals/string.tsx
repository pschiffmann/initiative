import { TextFieldControl } from "@initiativejs/ide/design-system";
import {
  JsonLiteralControlProps,
  JsonLiteralSchema,
  t,
} from "@initiativejs/schema";
import * as $Object from "@pschiffmann/std/object";

export const StringLiteralSchema = new JsonLiteralSchema<string>({
  name: "@initiativejs/std::string",
  type: t.string(),
  doc: `A static single-line string.`,
  initialValue() {
    return "";
  },
  validate(value) {
    if (typeof value === "string") return null;
    return `Expected string, got '${$Object.getType(value)}'.`;
  },
  format(value) {
    return JSON.stringify(value);
  },
  control: StringLiteralControl,
});

function StringLiteralControl(props: JsonLiteralControlProps<string>) {
  return <TextFieldControl {...props} />;
}
