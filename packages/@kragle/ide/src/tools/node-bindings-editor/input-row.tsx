import { InputBindingJson, t } from "@kragle/runtime";
import { ReactElement } from "react";
import { bemClasses } from "../../bem-classes.js";

const cls = bemClasses("input-row");

export interface InputRowProps {
  inputName: string;
  type: t.KragleType;
  binding: InputBindingJson | null;
}

export function InputRow({ inputName, type, binding }: InputRowProps) {
  const valueEditor = resolveBindingEditor(type, binding);
  return (
    <div className={cls.block()}>
      <div className={cls.element("connector")} />
      <div className={cls.element("name")}>{inputName}</div>
      <div className={cls.element("type")}>{type.toString()}</div>
      {valueEditor}
    </div>
  );
}

function resolveBindingEditor(
  type: t.KragleType,
  binding: InputBindingJson | null
): ReactElement {
  if (t.string().isAssignableTo(type) && binding?.type === "constant") {
    return <StringBindingEditor binding={binding} />;
  }
  return <UnboundConnector />;
}

function UnboundConnector() {
  return (
    <div className={cls.element("value-group")}>
      <select className={cls.element("select")}>
        <option>No value</option>
        <optgroup label="Static value">
          <option>Enter text ...</option>
        </optgroup>
      </select>
    </div>
  );
}

function NodeOutputBindingEditor() {
  return <div className={cls.element("value-group")}>🔗</div>;
}

interface StringBindingEditorProps {
  binding: InputBindingJson;
}

function StringBindingEditor({ binding }: StringBindingEditorProps) {
  return (
    <div className={cls.element("value-group")}>
      <input
        type="text"
        className={cls.element("textfield")}
        value={(binding as any).value}
        onChange={() => {}}
      />
      <button className={cls.element("unbind")}>❌</button>
    </div>
  );
}
