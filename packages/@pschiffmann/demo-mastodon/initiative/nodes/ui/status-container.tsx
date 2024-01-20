import { NodeComponentProps } from "@initiative.dev/schema";
import { styled } from "@mui/material";
import { StatusContainerSchema } from "./status-container.schema.js";

export function StatusContainer({
  slots,
  ...props
}: NodeComponentProps<StatusContainerSchema>) {
  return (
    <Root {...props}>
      <Header>
        <slots.header.Component />
      </Header>
      <Content>
        <slots.child.Component />
      </Content>
    </Root>
  );
}

const Root = styled("div")(({ theme }) => ({
  isolation: "isolate",
  width: 600,
  borderRadius: theme.shape.borderRadius,
}));

const Header = styled("div")(({ theme: { palette, shape } }) => ({
  position: "sticky",
  top: 8,
  zIndex: 1,
  height: 48,
  backgroundColor: palette.background.paper,
  borderRadius: `${shape.borderRadius}px ${shape.borderRadius}px 0 0`,
}));

const Content = styled("div")(({ theme }) => ({
  zIndex: 0,
  backgroundColor: theme.palette.background.paper,
}));
