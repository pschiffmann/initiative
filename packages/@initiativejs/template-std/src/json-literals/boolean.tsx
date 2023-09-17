import { CheckboxControl } from "@initiativejs/ide/design-system";
import {
  JsonLiteralControlProps,
  JsonLiteralSchema,
  t,
} from "@initiativejs/schema";
import * as $Object from "@pschiffmann/std/object";

export const BooleanLiteralSchema = new JsonLiteralSchema<boolean>({
  name: "@initiativejs/std::boolean",
  type: t.boolean(),
  doc: `A static boolean.`,
  initialValue() {
    return false;
  },
  validate(value) {
    if (typeof value === "boolean") return null;
    return `Expected boolean, got '${$Object.getType(value)}'.`;
  },
  format(value) {
    return JSON.stringify(value);
  },
  control: BooleanLiteralControl,
});

function BooleanLiteralControl(props: JsonLiteralControlProps<boolean>) {
  return <CheckboxControl {...props} />;
}
