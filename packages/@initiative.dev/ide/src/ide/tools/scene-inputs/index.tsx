import { TextAreaControl, bemClasses } from "#design-system";
import { SceneDocument, SceneInputJson, useSceneInputs } from "#shared";
import { t } from "@initiative.dev/schema";
import { ExpressionControl } from "../../expression-controls/index.js";
import { ToolFrame } from "../tool-frame.js";

const cls = bemClasses("initiative-scene-inputs");

export interface SceneInputsProps {
  document: SceneDocument;
  className?: string;
}

export function SceneInputs({ document, className }: SceneInputsProps) {
  useSceneInputs(document);
  return (
    <ToolFrame className={cls.block(className)} title="Scene Inputs">
      {document.sceneInputs.size === 0 ? (
        <div className={cls.element("empty-state")}>
          This scene has no inputs.
        </div>
      ) : (
        <div className={cls.element("list")}>
          {[...document.sceneInputs.keys()].map((inputName) => (
            <SceneInputControlGroup
              key={inputName}
              document={document}
              inputName={inputName}
            />
          ))}
        </div>
      )}
    </ToolFrame>
  );
}

interface SceneInputControlGroupProps {
  document: SceneDocument;
  inputName: string;
}

function SceneInputControlGroup({
  document,
  inputName,
}: SceneInputControlGroupProps) {
  const { type, doc, debugValue } = document.sceneInputs.get(inputName)!;

  function setSceneInput(json: Partial<SceneInputJson>) {
    document.applyPatch({
      type: "set-scene-input",
      inputName,
      inputJson: {
        type: t.toJson(type),
        doc,
        debugValue: debugValue?.toJson() ?? null,
        ...json,
      },
    });
  }

  return (
    <>
      <div className={cls.element("input-name")}>{inputName}</div>
      <ExpressionControl
        parent="node"
        name={inputName}
        expectedType={type}
        doc={
          "This value is only used to preview the scene during development. " +
          "It will not be emitted in production builds, and is not used if " +
          "this scene is imported in another scene."
        }
        expression={debugValue}
        onChange={(debugValue) => setSceneInput({ debugValue })}
      />
      <TextAreaControl
        label="Documentation"
        helpText={
          "This doc comment is displayed in the IDE when this scene is " +
          "imported in another scene. It also gets emitted into production " +
          "builds."
        }
        value={doc}
        onChange={(doc) => setSceneInput({ doc: doc || undefined })}
        onClear={() => setSceneInput({ doc: undefined })}
      />
    </>
  );
}
