import { useSceneInputs } from "#shared";
import { ObjectMap } from "@pschiffmann/std/object-map";
import { ErrorComponent } from "./error-component.js";
import { evaluateExpression } from "./evaluate-expression.js";
import { SceneRuntime } from "./scene-runtime.js";
import { Scene } from "./scene.js";

export interface RootSceneProps {
  runtime: SceneRuntime;
  debugValues: ObjectMap<any>;
}

export function RootScene({ runtime, debugValues }: RootSceneProps) {
  const sceneInputData = useSceneInputs(runtime.document);
  const sceneInputs = new Map<string, any>();
  const invalidSceneInputs: string[] = [];
  for (const [name, data] of sceneInputData) {
    if (!data.debugValue || data.debugValue.hasErrors) {
      invalidSceneInputs.push(name);
    } else {
      sceneInputs.set(
        name,
        evaluateExpression(
          data.debugValue,
          runtime.document.definitions,
          debugValues,
          null,
        ),
      );
    }
  }

  if (invalidSceneInputs.length) {
    return (
      <ErrorComponent
        title={`Error in scene '${runtime.document.name}':`}
        details={invalidSceneInputs.map(
          (inputName) => `Scene input '${inputName}' has invalid debug value.`,
        )}
      />
    );
  }

  return <Scene runtime={runtime} sceneInputs={sceneInputs} />;
}
