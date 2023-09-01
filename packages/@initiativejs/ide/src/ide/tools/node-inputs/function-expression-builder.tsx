import { AlertDialogContent, Button, bemClasses } from "#design-system";
import { Expression, ExpressionJson, ExpressionPath } from "#shared";
import { t } from "@initiativejs/schema";
import { controlComponents } from "./controls.js";

const cls = bemClasses("initiative-function-expression-builder");

export interface FunctionExpressionBuilderProps {
  label: string;
  helpText: string;
  inputType: t.Type;
  expression: Expression;
  onChange(json: ExpressionJson | null): void;
  onClose(): void;
}

export function FunctionExpressionBuilder({
  label,
  helpText,
  inputType,
  expression,
  onChange,
  onClose,
}: FunctionExpressionBuilderProps) {
  return (
    <AlertDialogContent
      className={cls.block()}
      title={`Edit input '${label}'`}
      actions={<Button label="Close" onPress={onClose} />}
    >
      <ExpressionContainer
        label={label}
        inputType={inputType}
        expression={expression}
        onChange={onChange}
      />
    </AlertDialogContent>
  );
}

interface ExpressionContainerProps {
  label: string;
  inputType: t.Type;
  expression: Expression;
  path?: ExpressionPath;
  onChange(json: ExpressionJson | null): void;
}

function ExpressionContainer({
  label,
  inputType,
  expression,
  path = "",
  onChange,
}: ExpressionContainerProps) {
  const json = expression.get(path || "/") ?? null;
  const expressionType = json?.type ?? "empty";

  if (expressionType !== "function-call") {
    const Control = controlComponents[expressionType];

    function handleNestedChange(json: ExpressionJson | null) {
      onChange(expression.set(path, json));
    }

    return (
      <Control
        label={label}
        helpText={`Expected type: ${inputType}`}
        errorText={expression.errors.get(path || "/")}
        inputType={inputType}
        json={json}
        onChange={handleNestedChange}
        onClear={() => handleNestedChange(null)}
      />
    );
  }

  const fnType = expression.types.get(`${path}/fn`) as t.Function;
  return (
    <>
      <ExpressionContainer
        label="Callable"
        inputType={t.function()()(inputType)}
        expression={expression}
        path={`${path}/fn`}
        onChange={onChange}
      />
      <div className={cls.element("bracket")}>(</div>
      <div className={cls.element("parameters")}>
        {[...fnType.requiredParameters, ...fnType.optionalParameters].map(
          (parameterType, i) => (
            <ExpressionContainer
              key={i}
              label={`Parameter ${i + 1}`}
              inputType={
                i > fnType.requiredParameters.length
                  ? t.optional(parameterType)
                  : parameterType
              }
              expression={expression}
              path={`${path}/arg(${i})`}
              onChange={onChange}
            />
          ),
        )}
      </div>
      <div className={cls.element("bracket")}>)</div>
    </>
  );
}
