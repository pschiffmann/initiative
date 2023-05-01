import { NodeSchema, SceneDocument, useNode } from "@kragle/runtime";
import { Fragment } from "react";
import { bemClasses } from "../../bem-classes.js";
import { CollectionInputRow } from "./collection-input-row.js";
import { InputRow } from "./input-row.js";
import { OutputRow } from "./output-row.js";
import { NodeBoxPosition } from "./use-layout.js";

const cls = bemClasses("node-box");

export interface NodeBoxProps {
  position: NodeBoxPosition;
  document: SceneDocument;
  schema: NodeSchema;
  nodeId: string;
}

export function NodeBox({ position, document, schema, nodeId }: NodeBoxProps) {
  const nodeJson = useNode(document, nodeId)!;

  const inputNames = Object.keys(schema.inputs);
  for (const [slotName, slotSchema] of Object.entries(schema.slots)) {
    for (const inputName of Object.keys(slotSchema.inputs ?? {})) {
      const children = nodeJson.collectionSlots[slotName];
      if (children.length) {
        inputNames.push(...children.map((_, i) => `${inputName}/${i}`));
      } else {
        inputNames.push(`${inputName}/-1`);
      }
    }
  }
  const outputNames = [
    ...Object.keys(schema.outputs),
    ...Object.values(schema.slots).flatMap((slotSchema) =>
      Object.keys(slotSchema.outputs ?? {})
    ),
  ];

  return (
    <div
      className={cls.block()}
      style={{ top: position.offsetTop, left: position.offsetLeft }}
    >
      <div className={cls.element("header")}>
        <div className={cls.element("id")}>{nodeId}</div>
        <div className={cls.element("type")}>{schema.name}</div>
      </div>

      {!!inputNames.length && (
        <>
          <div className={cls.element("section")}>Inputs</div>
          {Object.entries(schema.inputs).map(([inputName, type]) => (
            <InputRow
              key={inputName}
              document={document}
              nodeId={nodeId}
              inputName={inputName}
              type={type}
              binding={nodeJson.inputs[inputName] ?? null}
            />
          ))}

          {Object.entries(schema.slots).map(([slotName, slotSchema]) => (
            <Fragment key={slotName}>
              {Object.entries(slotSchema.inputs ?? {}).map(
                ([inputName, type]) => (
                  <CollectionInputRow
                    key={inputName}
                    inputName={inputName}
                    type={type}
                    slotChildren={nodeJson.collectionSlots[slotName]}
                  />
                )
              )}
            </Fragment>
          ))}
        </>
      )}

      {!!outputNames.length && (
        <>
          <div className={cls.element("section")}>Outputs</div>
          {[
            ...Object.entries(schema.outputs),
            ...Object.values(schema.slots).flatMap((slotSchema) =>
              Object.entries(slotSchema.outputs ?? {})
            ),
          ].map(([outputName, type]) => (
            <OutputRow key={outputName} outputName={outputName} type={type} />
          ))}
        </>
      )}
    </div>
  );
}
