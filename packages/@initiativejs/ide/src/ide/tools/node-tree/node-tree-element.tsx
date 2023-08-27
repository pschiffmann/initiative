import {
  ColorSchemeContext,
  IconButton,
  MaterialIcon,
  Typography,
  bemClasses,
} from "#design-system";
import { NodeData, SceneDocument, useNode } from "#shared";
import { CommandController } from "@initiativejs/react-command";
import {
  TonalPalette,
  argbFromHex,
  hexFromArgb,
} from "@material/material-color-utilities";
import { memo, useContext, useMemo, useState } from "react";
import { CreateNodeDialog } from "./create-node-dialog.js";

const cls = bemClasses("initiative-node-tree-element");

declare module "csstype" {
  interface Properties {
    "--initiative-node-tree-element-fill-color"?: string;
    "--initiative-node-tree-element-stroke-color"?: string;
  }
}

export interface NodeTreeElementProps {
  document: SceneDocument;
  selectedNode: string | null;
  onSelectedNodeChange(nodeId: string | null): void;
  nodeId: string;
}

export const NodeTreeElement = memo(function NodeTreeElement_({
  document,
  selectedNode,
  onSelectedNodeChange,
  nodeId,
}: NodeTreeElementProps) {
  const nodeData: NodeData = useNode(document, nodeId);
  const nodeEditor = nodeData.schema.editor;
  const colorScheme = useContext(ColorSchemeContext);
  const style = useMemo(() => {
    if (!nodeEditor?.color) return undefined;
    const customPalette = TonalPalette.fromInt(argbFromHex(nodeEditor.color));
    return {
      "--initiative-node-tree-element-fill-color": hexFromArgb(
        customPalette.tone(colorScheme !== "light" ? 20 : 80),
      ),
      "--initiative-node-tree-element-stroke-color": hexFromArgb(
        customPalette!.tone(colorScheme !== "light" ? 80 : 20),
      ),
    };
  }, [colorScheme]);

  const [collapsed, setCollapsed] = useState(new Set<string>());
  function toggleCollapsed(slotName: string) {
    const result = new Set(collapsed);
    collapsed.has(slotName) ? result.delete(slotName) : result.add(slotName);
    setCollapsed(result);
  }

  const selected = nodeId === selectedNode;
  function toggleSelected() {
    onSelectedNodeChange(selected ? null : nodeId);
  }

  const [createNodeDialogController] = useState(
    () => new CommandController<string>(),
  );

  return (
    <div className={cls.block()}>
      <div
        className={cls.element(
          "node-id-container",
          null,
          selected && "selected",
        )}
        onClick={toggleSelected}
        style={style}
      >
        {nodeEditor?.icon !== undefined ? (
          <MaterialIcon
            icon={nodeEditor.icon}
            className={cls.element("icon")}
          />
        ) : undefined}
        <Typography
          className={cls.element("node-id")}
          variant="body-medium"
          noWrap
        >
          {nodeId}
        </Typography>
      </div>
      <ul className={cls.element("slots")}>
        {nodeData.schema.forEachSlot((slotName, { isCollectionSlot }) => {
          const isCollapsed = collapsed.has(slotName);
          return (
            <li key={slotName} className={cls.element("slot")}>
              <div className={cls.element("slot-name")}>
                <IconButton
                  className={cls.element("expand-button")}
                  label={isCollapsed ? "Expand" : "Collapse"}
                  icon={isCollapsed ? "arrow_right" : "arrow_drop_down"}
                  onPress={() => toggleCollapsed(slotName)}
                />
                {slotName}
                {(isCollectionSlot || !nodeData.slots[slotName]) && (
                  <IconButton
                    className={cls.element("add-button")}
                    label="Add"
                    icon="add"
                    onPress={() => createNodeDialogController.send(slotName)}
                  />
                )}
              </div>
              {!isCollapsed && (
                <ul className={cls.element("children")}>
                  {nodeData.forEachChildInSlot(slotName, (childId) => (
                    <NodeTreeElement
                      key={childId}
                      document={document}
                      selectedNode={selectedNode}
                      onSelectedNodeChange={onSelectedNodeChange}
                      nodeId={childId}
                    />
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>

      <CreateNodeDialog
        commandStream={createNodeDialogController}
        document={document}
        parentId={nodeId}
      />
    </div>
  );
});
