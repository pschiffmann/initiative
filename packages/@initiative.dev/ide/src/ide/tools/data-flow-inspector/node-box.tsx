import {
  ColorSchemeContext,
  IconButton,
  Typography,
  bemClasses,
} from "#design-system";
import { ComponentNodeData } from "#shared";
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
  data: ComponentNodeData;
  focus: string | null;
  positioning: NodeBoxPosition;
}

export function NodeBox({ data, focus, positioning }: NodeBoxProps) {
  const schema = data.schema;

  const colorScheme = useContext(ColorSchemeContext);
  const style = useMemo(() => {
    const color = data.schema.editor?.color;
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
      className={cls.block()}
      style={{
        top: positioning.offsetTop,
        left: positioning.offsetLeft,
        ...style,
      }}
    >
      <Typography className={cls.element("id")} variant="title-medium" noWrap>
        {data.id}
      </Typography>
      <Typography className={cls.element("type")} variant="label-medium" noWrap>
        {data.type}
      </Typography>
      {data.forEachInput((expression, type, inputName, index) => {
        const inputKey =
          index === undefined ? inputName : `${inputName}::${index}`;
        return <Input key={inputKey} name={inputKey} />;
      })}
      {schema.forEachOutput((outputName) => (
        <Output key={outputName} name={outputName} />
      ))}
    </div>
  );
}

interface InputOutputProps {
  name: string;
}

function Input({ name }: InputOutputProps) {
  return (
    <>
      <IconButton
        className={cls.element("input-socket")}
        label="Connect input"
        icon="login"
      />
      <Typography
        variant="body-medium"
        noWrap
        className={cls.element("input-name")}
      >
        {name}
      </Typography>
      <IconButton
        className={cls.element("input-button")}
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
