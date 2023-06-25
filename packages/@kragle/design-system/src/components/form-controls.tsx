import { ReactNode, useId } from "react";
import { bemClasses } from "../util/bem-classes.js";
import { IconButton } from "./icon-button.js";
import { MaterialIcon } from "./material-icon.js";

const cls = bemClasses("kragle-form-control");

interface BaseFormControlProps {
  label: string;
  helpText?: string;
  errorText?: string;
  onClear?(): void;
  className?: string;
}

interface FormControlLayoutProps extends BaseFormControlProps {
  adornmentIcon: string;
  id: string;
  children: ReactNode;
}

function FormControlLayout({
  label,
  helpText,
  errorText,
  adornmentIcon,
  onClear,
  id,
  className,
  children,
}: FormControlLayoutProps) {
  return (
    <div className={cls.block(className)}>
      <div className={cls.element("header")}>
        {errorText && (
          <MaterialIcon
            className={cls.element("error-icon")}
            icon="warning_amber"
            title={errorText}
          />
        )}
        <label className={cls.element("label")} htmlFor={id}>
          {label}
        </label>
        {helpText && (
          <MaterialIcon
            className={cls.element("help-icon")}
            icon="info"
            title={helpText}
          />
        )}
      </div>
      {children}
      <MaterialIcon
        className={cls.element("adornment-icon")}
        icon={adornmentIcon}
      />
      {onClear && (
        <IconButton
          className={cls.element("clear-button")}
          label="Clear"
          icon="clear"
          onPress={onClear}
        />
      )}
    </div>
  );
}

export interface TextFieldControlProps extends BaseFormControlProps {
  value: string;
  onChange(value: string): void;
}

export function TextFieldControl({
  value,
  onChange,
  ...props
}: TextFieldControlProps) {
  const id = useId();
  return (
    <FormControlLayout adornmentIcon="text_fields" id={id} {...props}>
      <input
        type="text"
        className={cls.element("input", null, "text-field")}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </FormControlLayout>
  );
}

export function NumberFieldControl() {}

export function CheckboxControl() {}

export function SelectControl() {}

export function ButtonControl() {}
