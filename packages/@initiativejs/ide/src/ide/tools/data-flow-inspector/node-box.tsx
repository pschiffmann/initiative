import { IconButton, Typography, bemClasses } from "#design-system";
import { NodeData } from "#shared";
import { NodeBoxPosition } from "./layout-algorithm.js";

const cls = bemClasses("initiative-node-box");

export interface NodeBoxProps {
  data: NodeData;
  focus: string | null;
  positioning: NodeBoxPosition;
}

export function NodeBox({ data, focus, positioning }: NodeBoxProps) {
  const schema = data.schema;

  return (
    <div
      className={cls.block()}
      style={{
        outlineStyle: data.id === focus ? "double" : "solid",
        position: "absolute",
        top: positioning.offsetTop,
        left: positioning.offsetLeft,
      }}
    >
      <Typography
        variant="headline-large"
        noWrap
        className={cls.element("header")}
      >
        {data.id}
      </Typography>
      {data.forEachInput((expression, type, inputName, index) => (
        <Input
          data={data}
          name={index === undefined ? inputName : `${inputName}::${index}`}
        ></Input>
      ))}
      {schema.forEachOutput((type) => (
        <Output data={data} name={type}></Output>
      ))}
    </div>
  );
}

interface InputOutputProps {
  data: NodeData;
  name: string;
}

function Input({ data, name }: InputOutputProps) {
  return (
    <>
      <IconButton
        className={cls.element("input-socket")}
        label="Connect input"
        icon="polyline"
      />
      <Typography
        variant="body-large"
        noWrap
        className={cls.element("input-name")}
      >
        {name}
      </Typography>
      <IconButton
        className={cls.element("input-button")}
        label="Edit input"
        icon="edit"
      />
    </>
  );
}

function Output({ data, name }: InputOutputProps) {
  return (
    <>
      <IconButton
        className={cls.element("output-socket")}
        label="Connect input"
        icon="polyline"
      />
      <Typography
        variant="body-large"
        noWrap
        className={cls.element("output-name")}
      >
        {name}
      </Typography>
      <IconButton
        className={cls.element("output-button")}
        label="Edit input"
        icon="edit"
      />
    </>
  );
}
