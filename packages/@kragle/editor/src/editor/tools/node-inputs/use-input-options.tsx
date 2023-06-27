import { t } from "@kragle/runtime";
import {
  ExpressionJson,
  NodeData,
  NodeOutputExpressionJson,
  SceneDocument,
  useSceneDocumentVersion,
} from "@kragle/runtime/v2";
import { ReactNode, createContext, useContext } from "react";

const AncestorOutputsContext = createContext<readonly AncestorOutput[]>([]);

export interface AncestorOutputsProviderProps {
  document: SceneDocument;
  nodeData: NodeData;
  children: ReactNode;
}

export function AncestorOutputsProvider({
  document,
  nodeData,
  children,
}: AncestorOutputsProviderProps) {
  useSceneDocumentVersion(document);

  const ancestorOutputs: AncestorOutput[] = [];
  for (let current = nodeData.parent; current; ) {
    const { nodeId, slotName } = current;
    const parentNodeData = document.getNode(nodeId);
    parentNodeData.schema.forEachOutput((type, outputName, outputScope) => {
      if (!outputScope || slotName === outputScope) {
        ancestorOutputs.push({
          expression: { type: "node-output", nodeId, outputName },
          type,
        });
      }
    });
    current = parentNodeData.parent;
  }

  return (
    <AncestorOutputsContext.Provider value={ancestorOutputs.reverse()}>
      {children}
    </AncestorOutputsContext.Provider>
  );
}

interface AncestorOutput {
  readonly expression: NodeOutputExpressionJson;
  readonly type: t.KragleType;
}

export interface InputExpressionOption {
  readonly label: string;
  readonly expression: ExpressionJson;
}

export function useInputOptions(
  document: SceneDocument,
  nodeData: NodeData,
  inputName: string
): readonly InputExpressionOption[] {
  const inputType = nodeData.schema.inputTypes[inputName];

  const options: InputExpressionOption[] = [];
  if (t.string().isAssignableTo(inputType)) {
    options.push({
      label: "Enter text ...",
      expression: { type: "string-literal", value: "" },
    });
  }
  if (t.number().isAssignableTo(inputType)) {
    options.push({
      label: "Enter number ...",
      expression: { type: "number-literal", value: 0 },
    });
  }
  if (t.boolean().isAssignableTo(inputType)) {
    options.push({
      label: "Choose boolean ...",
      expression: { type: "boolean-literal", value: false },
    });
  }
  if (t.Union.is(inputType)) {
    for (const element of inputType.elements) {
      if (t.String.is(element) && element.value !== undefined) {
        options.push({
          label: JSON.stringify(element.value),
          expression: { type: "string-literal", value: element.value },
        });
      }
      if (t.Number.is(element) && element.value !== undefined) {
        options.push({
          label: `${element.value}`,
          expression: { type: "number-literal", value: element.value },
        });
      }
      if (t.Boolean.is(element) && element.value !== undefined) {
        options.push({
          label: `${element.value}`,
          expression: { type: "boolean-literal", value: element.value },
        });
      }
    }
  }

  const ancestorOutputs = useContext(AncestorOutputsContext);
  for (const { expression, type } of ancestorOutputs) {
    if (type.isAssignableTo(inputType)) {
      options.push({
        label: `${expression.nodeId}::${expression.outputName}`,
        expression,
      });
    }
    if (t.Function.is(type) && type.returns.isAssignableTo(inputType)) {
      options.push({
        label: `${expression.nodeId}::${expression.outputName}()`,
        expression: { type: "function-call", fn: expression, args: [] },
      });
    }
  }

  for (const libraryDefinition of document.definitions.libraries.values()) {
    const libraryName = libraryDefinition.schema.name;
    for (const [memberName, type] of Object.entries(
      libraryDefinition.schema.members
    )) {
      if (type.isAssignableTo(inputType)) {
        options.push({
          label: `${libraryName}::${memberName}`,
          expression: { type: "library-member", libraryName, memberName },
        });
      }
      if (t.Function.is(type) && type.returns.isAssignableTo(inputType)) {
        options.push({
          label: `${libraryName}::${memberName}()`,
          expression: {
            type: "function-call",
            fn: { type: "library-member", libraryName, memberName },
            args: [],
          },
        });
      }
    }
  }

  return options;
}
