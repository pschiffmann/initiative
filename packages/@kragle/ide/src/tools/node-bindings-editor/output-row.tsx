import { t } from "@kragle/runtime";
import { bemClasses } from "../../bem-classes.js";

const cls = bemClasses("output-row");

export interface OutputRowProps {
  outputName: string;
  type: t.KragleType;
}

export function OutputRow({ outputName, type }: OutputRowProps) {
  return (
    <div className={cls.block()}>
      <div className={cls.element("connector")} />
      <div className={cls.element("name")}>{outputName}</div>
      <div className={cls.element("type")}>{type.toString()}</div>
    </div>
  );
}
