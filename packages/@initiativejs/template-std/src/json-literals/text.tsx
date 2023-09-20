import { TextAreaControl } from "@initiativejs/ide/design-system";
import {
  JsonLiteralControlProps,
  JsonLiteralSchema,
  t,
} from "@initiativejs/schema";
import * as $Object from "@pschiffmann/std/object";

export const TextLiteralSchema = new JsonLiteralSchema<string>({
  name: "@initiativejs/std::text",
  type: t.string(),
  doc: `A static multi-line string.`,
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
  control: TextLiteralControl,
});

function TextLiteralControl(props: JsonLiteralControlProps<string>) {
  return <TextAreaControl {...props} />;
}
