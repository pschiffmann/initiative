import { NodeComponentProps } from "@initiative.dev/schema";
import {
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { InventoryListSchema } from "./inventory-list.schema.js";

export function InventoryList({
  items,
}: NodeComponentProps<InventoryListSchema>) {
  return (
    <List
      sx={{
        height: 1,
        overflow: "auto",
        boxSizing: "border-box",
        border: "1px solid lightgrey",
      }}
      disablePadding
      dense
    >
      {items.map((stack, i) => (
        <ListItem key={i} disablePadding dense>
          <ListItemButton>
            <ListItemAvatar>
              <Avatar>{stack.item.icon}</Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={stack.item.name}
              secondary={`${stack.size} / ${stack.item.maxStackSize}`}
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
}
