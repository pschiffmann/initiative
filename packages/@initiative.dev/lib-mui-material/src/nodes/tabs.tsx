import { NodeComponentProps } from "@initiative.dev/schema";
import { Box, Tabs as MuiTabs, Tab } from "@mui/material";
import { useState } from "react";
import { TabsSchema } from "./tabs.schema.js";

export function Tabs({
  iconPosition,
  label,
  icon,
  disabled,
  slots,
  ...props
}: NodeComponentProps<TabsSchema>) {
  const [active, setActive] = useState(0);

  return (
    <Box>
      <MuiTabs
        value={active}
        onChange={(_, active) => setActive(active)}
        {...props}
      >
        {label.map((label, i) => (
          <Tab
            key={i}
            label={label}
            icon={icon[i]}
            iconPosition={iconPosition}
            disabled={disabled[i]}
          />
        ))}
      </MuiTabs>
      <slots.tab.Component index={active} />
    </Box>
  );
}
