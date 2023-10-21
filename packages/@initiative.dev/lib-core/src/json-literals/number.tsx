import { NumberFieldControl } from "@initiative.dev/ide/design-system";
import {
  JsonLiteralControlProps,
  JsonLiteralSchema,
  t,
} from "@initiative.dev/schema";
import * as $Object from "@pschiffmann/std/object";

export const NumberLiteralSchema = new JsonLiteralSchema<number>({
  name: "@initiative.dev/std::number",
  type: t.number(),
  doc: `A static number.`,
  initialValue() {
    return 0;
  },
  validate(value) {
    if (typeof value === "number") return null;
    return `Expected number, got '${$Object.getType(value)}'.`;
  },
  format(value) {
    return JSON.stringify(value);
  },
  control: NumberLiteralControl,
});

function NumberLiteralControl(props: JsonLiteralControlProps<number>) {
  return <NumberFieldControl {...props} />;
}
