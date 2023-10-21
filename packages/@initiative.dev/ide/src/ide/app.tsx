import {
  ColorSchemeContext,
  IconButton,
  bemClasses,
  useColorTheme,
} from "#design-system";
import { SceneDocument, SceneDocumentProvider } from "#shared";
import { Definitions } from "@initiative.dev/schema";
import { useRef, useState } from "react";
import { DefinitionsContext, LocaleContext } from "./context.js";
import { LicenseStatus } from "./tools/license-status/index.js";
import { NodeInputs } from "./tools/node-inputs/index.js";
import { NodeTree } from "./tools/node-tree/index.js";
import { SceneInputs } from "./tools/scene-inputs/index.js";
import { StageView } from "./tools/stage-view.js";
import { WorkspaceManager } from "./tools/workspace-manager/index.js";

const cls = bemClasses("initiative-editor");

export interface AppProps {
  definitions: Definitions;
  formatJsFile?(source: string): string | Promise<string>;
}

export function App({ definitions, formatJsFile }: AppProps) {
  const [locale, setLocale] = useState("");
  const [document, setDocument] = useState<SceneDocument | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const { rootRef, toggleColorScheme, colorScheme } = useApplyColorTheme();

  return (
    <DefinitionsContext.Provider value={definitions}>
      <ColorSchemeContext.Provider value={colorScheme}>
        <LocaleContext.Provider value={{ value: locale, onChange: setLocale }}>
          <div ref={rootRef} className={cls.block()}>
            <WorkspaceManager
              className={cls.element("workspace-manager")}
              formatJsFile={formatJsFile}
              document={document}
              onDocumentChange={(document) => {
                setSelectedNode(null);
                setDocument(document);
                const locale = document?.projectConfig.locales?.[0];
                if (locale) setLocale(locale);
              }}
            />
            {document ? (
              <SceneDocumentProvider document={document}>
                <NodeTree
                  className={cls.element("node-tree")}
                  document={document}
                  selectedNode={selectedNode}
                  onSelectedNodeChange={setSelectedNode}
                />
                <StageView
                  className={cls.element("stage-view")}
                  document={document}
                />
                {selectedNode ? (
                  <NodeInputs
                    className={cls.element("node-inputs")}
                    document={document}
                    selectedNode={selectedNode}
                  />
                ) : (
                  <SceneInputs
                    className={cls.element("node-inputs")}
                    document={document}
                  />
                )}
              </SceneDocumentProvider>
            ) : (
              <>
                <EmptyTool position="node-tree" />
                <EmptyTool position="stage-view" />
                <EmptyTool position="node-inputs" />
              </>
            )}
            <div className={cls.element("actions")}>
              <IconButton
                icon="dark_mode"
                label="Toggle dark mode"
                onPress={toggleColorScheme}
              />
              <IconButton icon="settings" label="Settings" disabled />
              <IconButton icon="notifications" label="Announcements" disabled />
            </div>
            <LicenseStatus className={cls.element("license-status")} />
          </div>
        </LocaleContext.Provider>
      </ColorSchemeContext.Provider>
    </DefinitionsContext.Provider>
  );
}

interface EmptyToolProps {
  position: string;
}

function EmptyTool({ position }: EmptyToolProps) {
  return (
    <div className={cls.element("empty-tool", null, position)}>
      No scene selected.
    </div>
  );
}

function useApplyColorTheme() {
  const localStorageKey = "@initiative.dev/ide.color-theme";

  const rootRef = useRef<HTMLDivElement>(null);
  const [colorScheme, setColorScheme] = useState<"light" | "dark">(() => {
    const colorScheme = localStorage.getItem(localStorageKey);
    return colorScheme === "light" || colorScheme === "dark"
      ? colorScheme
      : "light";
  });
  useColorTheme(rootRef, colorScheme);

  function toggleColorScheme() {
    const newColorScheme = colorScheme === "light" ? "dark" : "light";
    localStorage.setItem(localStorageKey, newColorScheme);
    setColorScheme(newColorScheme);
  }

  return { rootRef, colorScheme, toggleColorScheme };
}
