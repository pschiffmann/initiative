import { t } from "@kragle/runtime";
import { bemClasses } from "../../bem-classes.js";

const cls = bemClasses("collection-input-row");

export interface CollectionInputRowProps {
  inputName: string;
  type: t.KragleType;
  slotChildren: readonly string[];
}

export function CollectionInputRow({
  inputName,
  type,
  slotChildren,
}: CollectionInputRowProps) {
  return (
    <div className={cls.block()}>
      <div className={cls.element("connector")} />
      <div className={cls.element("name")}>{inputName}</div>
      <div className={cls.element("type")}>{type.toString()}</div>
      <div className={cls.element("values")}>
        {slotChildren.map((childId, i) => (
          <div key={childId} className={cls.element("value")}>
            <div className={cls.element("child-id")}>{childId}</div>
            <div className={cls.element("value-group")}>
              <select className={cls.element("select")}>
                <option>No value</option>
                <optgroup label="Static value">
                  <option>Enter text ...</option>
                </optgroup>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
