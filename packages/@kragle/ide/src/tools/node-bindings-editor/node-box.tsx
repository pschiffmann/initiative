import { AnyNodeSchema, NodeJson, t } from "@kragle/runtime";
import { Fragment } from "react";
import { bemClasses } from "../../bem-classes.js";

const cls = bemClasses("node-box");

export interface NodeBoxProps {
  schema: AnyNodeSchema;
  nodeId: string;
  nodeJson: NodeJson;
}

export function NodeBox({ schema, nodeId, nodeJson }: NodeBoxProps) {
  return (
    <div className="node-box">
      <div className="node-box__id">{nodeId}</div>
      <div className="node-box__type">{schema.name}</div>
      <div className="node-box__section">Inputs</div>
      {Object.entries(schema.inputs).map(([inputName, type]) => (
        <div key={inputName} className="node-box__io-row">
          <div className="node-box__io-connector node-box__io-connector--input" />
          <div className="node-box__io-name node-box__io-name--input">
            {inputName}
          </div>
          <input
            type="text"
            className="node-box__io-input"
            placeholder="hello world"
          />
          <div className="node-box__io-type node-box__io-type--input">
            {type.toString()}
          </div>
        </div>
      ))}
      {Object.entries(nodeJson.collectionSlots).map(([slotName, children]) => (
        <Fragment key={slotName}>
          {children.map((childId, i) => (
            <Fragment key={i}>
              <div className="node-box__input-group">
                {slotName} {i + 1} ({childId})
              </div>
              {[...schema.getCollectionInputs()].map(([inputName, type]) => (
                <div key={inputName} className="node-box__io-row">
                  <div className="node-box__io-connector node-box__io-connector--input" />
                  <div className="node-box__io-name node-box__io-name--input">
                    {inputName}
                  </div>
                  <div className="node-box__io-type node-box__io-type--input">
                    {type.toString()}
                  </div>
                </div>
              ))}
            </Fragment>
          ))}
        </Fragment>
      ))}

      <div className="node-box__section">Outputs</div>
      {[
        ...Object.entries(schema.outputs),
        ...Object.values(schema.slots).flatMap((slotSchema) =>
          Object.entries(slotSchema.outputs ?? {})
        ),
      ].map(([outputName, type]) => (
        <div key={outputName} className="node-box__io-row">
          <div className="node-box__io-connector node-box__io-connector--output" />
          <div className="node-box__io-name node-box__io-name--output">
            {outputName}
          </div>
          <div className="node-box__io-type node-box__io-type--output">
            {type.toString()}
          </div>
        </div>
      ))}
    </div>
  );
}

interface InputRowProps {
  inputName: string;
  type: t.KragleType;
}

function InputRow({ inputName, type }: InputRowProps) {
  return (
    <div className={cls.element("input-row")}>
      <div className={cls.element("input-name")}>{inputName}</div>
      <div className={cls.element("input-type")}>{type.toString()}</div>
    </div>
  );
}

function StringInput() {}
