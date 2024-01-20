import { useSceneInputs } from "#shared";
import { StyleProps } from "@initiative.dev/schema";
import { ObjectMap } from "@pschiffmann/std/object-map";
import { useContext } from "react";
import { LocaleContext } from "./context.js";
import { ErrorComponent } from "./error-component.js";
import { evaluateExpression } from "./evaluate-expression.js";
import { SceneRuntime } from "./scene-runtime.js";
import { Scene } from "./scene.js";

export interface RootSceneProps extends StyleProps {
  runtime: SceneRuntime;
  debugValues: ObjectMap<any>;
}

export function RootScene({
  runtime,
  debugValues,
  className,
  style,
}: RootSceneProps) {
  const locale = useContext(LocaleContext);
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
          locale,
          debugValues,
          null,
        ),
      );
    }
  }

  if (invalidSceneInputs.length) {
    return (
      <ErrorComponent
        className={className}
        style={style}
        title={`Error in scene '${runtime.document.name}':`}
        details={invalidSceneInputs.map(
          (inputName) => `Scene input '${inputName}' has invalid debug value.`,
        )}
      />
    );
  }

  return (
    <Scene
      className={className}
      style={style}
      runtime={runtime}
      sceneInputs={sceneInputs}
    />
  );
}
