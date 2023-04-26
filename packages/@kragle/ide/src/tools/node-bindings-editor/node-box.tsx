import { AnyNodeSchema, NodeJson } from "@kragle/runtime";
import { bemClasses } from "../../bem-classes.js";
import { CollectionInputRow } from "./collection-input-row.js";
import { InputRow } from "./input-row.js";
import { OutputRow } from "./output-row.js";

const cls = bemClasses("node-box");

export interface NodeBoxProps {
  schema: AnyNodeSchema;
  nodeId: string;
  nodeJson: NodeJson;
}

export function NodeBox({ schema, nodeId, nodeJson }: NodeBoxProps) {
  schema.getCollectionInputs();
  return (
    <div className={cls.block()}>
      <div className={cls.element("header")}>
        <div className={cls.element("id")}>{nodeId}</div>
        <div className={cls.element("type")}>{schema.name}</div>
      </div>

      <div className={cls.element("section")}>Inputs</div>
      {Object.entries(schema.inputs).map(([inputName, type]) => (
        <InputRow
          key={inputName}
          inputName={inputName}
          type={type}
          binding={nodeJson.inputs[inputName] ?? null}
        />
      ))}

      {/* {["Column 1", "Column 2"].map((name) => (
        <Fragment key={name}>
          <div className={cls.element("collection-input")}>{name}</div>
          {Object.entries(schema.inputs).map(([inputName, type]) => (
            <InputRow
              key={inputName}
              inputName={inputName}
              type={type}
              binding={nodeJson.inputs[inputName] ?? null}
            />
          ))}
        </Fragment>
      ))} */}

      {Object.entries(schema.inputs).map(([inputName, type]) => (
        <CollectionInputRow
          inputName={inputName}
          type={type}
          slotChildren={["Column1", "Column2", "Column3"]}
        />
      ))}

      <div className={cls.element("section")}>Outputs</div>
      {[
        ...Object.entries(schema.outputs),
        ...Object.values(schema.slots).flatMap((slotSchema) =>
          Object.entries(slotSchema.outputs ?? {})
        ),
      ].map(([outputName, type]) => (
        <OutputRow key={outputName} outputName={outputName} type={type} />
      ))}
    </div>
  );
}
