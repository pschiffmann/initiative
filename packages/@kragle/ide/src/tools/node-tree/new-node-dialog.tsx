import { SceneDocument } from "@kragle/runtime";
import { useRef } from "react";

export interface NewNodeDialogProps {
  document: SceneDocument;
  parentId: string;
  parentSlot: string;
}

export function NewNodeDialog({
  document,
  parentId,
  parentSlot,
}: NewNodeDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  function createNode(nodeType: string) {
    dialogRef.current!.close();
    document.applyPatch({
      type: "create-node",
      nodeType,
      parentId,
      parentSlot,
    });
  }

  return (
    <>
      <button onClick={() => dialogRef.current!.showModal()}>Add node</button>
      <dialog ref={dialogRef}>
        <h1>Add new node</h1>
        <ul>
          {[...document.nodeDefinitions.keys()].map((nodeType) => (
            <li key={nodeType} onClick={() => createNode(nodeType)}>
              {nodeType}
            </li>
          ))}
        </ul>
      </dialog>
    </>
  );
}
