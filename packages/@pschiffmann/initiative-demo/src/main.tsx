// import { ArticleManagement } from "#initiative/scenes/article-management/scene.js";
import {
  SceneSlotTest,
  TriggerSlotProps,
} from "#initiative/scenes/scene-slot-test/scene.js";
import { Button } from "@mui/material";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { LocaleProvider } from "../initiative/locale-context.js";

function TriggerButton({ openDialog, ...props }: TriggerSlotProps) {
  return (
    <Button onClick={openDialog} {...props}>
      Injected into trigger slot
    </Button>
  );
}

const slots = {
  Trigger: TriggerButton,
} as const;

const root = createRoot(document.querySelector("#root")!);
root.render(
  <StrictMode>
    <LocaleProvider locale="en">
      <SceneSlotTest slots={slots} />
      {/* <ArticleManagement
        article={{ id: 12345, name: "Frog", price: 499 }}
        username="pschiffmann"
      /> */}
    </LocaleProvider>
  </StrictMode>,
);
