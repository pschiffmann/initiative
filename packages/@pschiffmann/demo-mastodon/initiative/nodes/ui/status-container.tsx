import { NodeComponentProps } from "@initiative.dev/schema";
import { styled } from "@mui/material";
import { StatusContainerSchema } from "./status-container.schema.js";

export function StatusContainer({
  slots,
}: NodeComponentProps<StatusContainerSchema>) {
  return (
    <Root>
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
  margin: `${theme.spacing(1)} auto`,
  borderRadius: theme.shape.borderRadius,
}));

const Header = styled("div")(({ theme }) => ({
  position: "sticky",
  top: 8,
  zIndex: 1,
  height: 48,
  backgroundColor: theme.palette.background.paper,
}));

const Content = styled("div")(({ theme }) => ({
  zIndex: 0,
  backgroundColor: theme.palette.background.paper,
}));
