import {
  ColorSchemeContext,
  IconButton,
  Typography,
  bemClasses,
} from "#design-system";
import {
  ComponentNodeData,
  ComponentNodeErrors,
  SlotNodeData,
  SlotNodeErrors,
} from "#shared";
import {
  TonalPalette,
  argbFromHex,
  hexFromArgb,
} from "@material/material-color-utilities";
import { useContext, useMemo } from "react";
import { NodeBoxPosition } from "./layout-algorithm.js";

declare module "csstype" {
  interface Properties {
    "--initiative-data-flow-inspector-node-box-fill-color"?: string;
    "--initiative-data-flow-inspector-node-box-stroke-color"?: string;
  }
}

const cls = bemClasses("initiative-data-flow-inspector-node-box");

export interface NodeBoxProps {
  data: ComponentNodeData | SlotNodeData;
  focus: string | null;
  positioning: NodeBoxPosition;
  onSelectedNodeChange(nodeId: string | null): void;
}

export function NodeBox({
  data,
  focus,
  positioning,
  onSelectedNodeChange,
}: NodeBoxProps) {
  const schema = data instanceof ComponentNodeData ? data.schema : null;

  const colorScheme = useContext(ColorSchemeContext);
  const style = useMemo(() => {
    const color = schema?.editor?.color;
    if (!color) return undefined;
    const customPalette = TonalPalette.fromInt(argbFromHex(color));
    return {
      "--initiative-data-flow-inspector-node-box-fill-color": hexFromArgb(
        customPalette.tone(colorScheme !== "light" ? 20 : 80),
      ),
      "--initiative-data-flow-inspector-node-box-stroke-color": hexFromArgb(
        customPalette!.tone(colorScheme !== "light" ? 80 : 20),
      ),
    };
  }, [colorScheme]);

  return (
    <div
      className={cls.block(null, data.id === focus && "focus")}
      style={{
        top: positioning.offsetTop,
        left: positioning.offsetLeft,

        ...style,
      }}
      onClick={() => {
        onSelectedNodeChange(data.id === focus ? null : data.id);
      }}
    >
      <Typography
        className={cls.element("id", null, data.errors ? "error" : null)}
        variant="title-medium"
        noWrap
      >
        {data.id}
      </Typography>
      <Typography className={cls.element("type")} variant="label-medium" noWrap>
        {data instanceof ComponentNodeData ? data.type : "SlotNode"}
      </Typography>
      {data instanceof ComponentNodeData
        ? data.forEachInput((expression, type, inputName, index) => {
            const inputKey =
              index === undefined ? inputName : `${inputName}::${index}`;
            return (
              <Input key={inputKey} name={inputKey} errors={data.errors} />
            );
          })
        : data.outputNames.map((name) => {
            return <Input key="name" name="name" />;
          })}
      {schema
        ? schema.forEachOutput((outputName) => (
            <Output key={outputName} name={outputName} />
          ))
        : null}
    </div>
  );
}

interface InputOutputProps {
  name: string;
  errors?: ComponentNodeErrors | SlotNodeErrors | null;
}

function Input({ name, errors }: InputOutputProps) {
  return (
    <>
      <IconButton
        className={cls.element(
          "input-socket",
          null,
          errors?.invalidInputs.has(name) ? "error" : null,
        )}
        label="Connect input"
        icon="login"
        disabled
      />
      <Typography
        variant="body-medium"
        noWrap
        className={cls.element(
          "input-name",
          null,
          errors?.invalidInputs.has(name) ? "error" : null,
        )}
      >
        {name}
      </Typography>
      <IconButton
        className={cls.element(
          "input-button",
          null,
          errors?.invalidInputs.has(name) ? "error" : null,
        )}
        label="Edit input"
        icon="edit"
        disabled
      />
    </>
  );
}

function Output({ name }: InputOutputProps) {
  return (
    <>
      <IconButton
        className={cls.element("output-socket")}
        label="Connect input"
        icon="logout"
      />
      <Typography
        variant="body-medium"
        noWrap
        className={cls.element("output-name")}
      >
        {name}
      </Typography>
      <IconButton
        className={cls.element("output-button")}
        label="Edit input"
        icon="edit"
        disabled
      />
    </>
  );
}
