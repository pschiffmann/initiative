import { SceneDocument, useNode } from "@kragle/runtime";
import { bemClasses } from "../../bem-classes.js";
import { NewNodeDialog } from "./new-node-dialog.js";

const cls = bemClasses("tree-element");

export interface TreeElementProps {
  document: SceneDocument;
  nodeId: string;
}

export function TreeElement({ nodeId, document }: TreeElementProps) {
  const nodeJson = useNode(document, nodeId)!;
  const { schema } = document.nodeDefinitions.get(nodeJson.type)!;
  const slots = Object.entries(schema.slots);

  function renameNode() {
    const newId = prompt("Enter new node id", nodeId);
    if (newId === null) return;
    try {
      document.applyPatch({ type: "rename-node", nodeId, newId });
    } catch (e) {
      alert(e);
    }
  }

  function deleteNode() {
    if (confirm(`Delete node '${nodeId}'?`)) {
      document.applyPatch({ type: "delete-node", nodeId });
    }
  }

  return (
    <div className={cls.block()}>
      <div className={cls.element("self")}>
        <div className={cls.element("node-id")}>{nodeId}</div>
        <button className={cls.element("self-button")} onClick={renameNode}>
          ✏️
        </button>
        <button className={cls.element("self-button")} onClick={deleteNode}>
          🗑️
        </button>
      </div>
      {slots.length !== 0 && (
        <div className={cls.element("slots")}>
          {slots.map(([slotName, slotSchema]) => {
            const isCollectionSlot = schema.isCollectionSlot(slotName);
            const canAddChild = isCollectionSlot || !nodeJson.slots[slotName];

            return (
              <div key={slotName} className={cls.element("slot")}>
                <div className={cls.element("slot-name")}>{slotName}</div>
                {isCollectionSlot
                  ? nodeJson.collectionSlots[slotName].map((childId) => (
                      <TreeElement
                        key={childId}
                        document={document}
                        nodeId={childId}
                      />
                    ))
                  : nodeJson.slots[slotName] && (
                      <TreeElement
                        document={document}
                        nodeId={nodeJson.slots[slotName]}
                      />
                    )}
                {canAddChild && (
                  <NewNodeDialog
                    document={document}
                    parentId={nodeId}
                    parentSlot={slotName}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
