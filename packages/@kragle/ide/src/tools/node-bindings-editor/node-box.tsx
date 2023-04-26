import { AnyNodeSchema, NodeJson } from "@kragle/runtime";
import { Fragment } from "react";
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

      {Object.entries(schema.slots).map(([slotName, slotSchema]) => (
        <Fragment key={slotName}>
          {Object.entries(slotSchema.inputs ?? {}).map(([inputName, type]) => (
            <CollectionInputRow
              key={inputName}
              inputName={inputName}
              type={type}
              slotChildren={nodeJson.collectionSlots[slotName]}
            />
          ))}
        </Fragment>
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
