import { ReactNode, useId } from "react";
import { bemClasses } from "../util/bem-classes.js";
import { IconButton } from "./icon-button.js";
import { MaterialIcon } from "./material-icon.js";

const cls = bemClasses("kragle-form-control");

export interface BaseFormControlProps {
  label: string;
  helpText?: string;
  errorText?: string;
  adornmentIcon?: string;
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
  onChange?(value: string): void;
}

export function TextFieldControl({
  adornmentIcon,
  value,
  onChange,
  ...props
}: TextFieldControlProps) {
  const id = useId();
  return (
    <FormControlLayout
      adornmentIcon={adornmentIcon ?? "text_fields"}
      id={id}
      {...props}
    >
      <input
        type="text"
        className={cls.element("input", null, "text-field")}
        id={id}
        readOnly={!onChange}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </FormControlLayout>
  );
}

export interface NumberFieldControlProps extends BaseFormControlProps {
  value: number;
  onChange(value: number): void;
}

export function NumberFieldControl({
  adornmentIcon,
  value,
  onChange,
  ...props
}: NumberFieldControlProps) {
  const id = useId();
  return (
    <FormControlLayout
      adornmentIcon={adornmentIcon ?? "text_fields"}
      id={id}
      {...props}
    >
      <input
        type="number"
        className={cls.element("input", null, "number-field")}
        id={id}
        value={value}
        onChange={(e) => onChange?.(Number.parseFloat(e.target.value))}
      />
    </FormControlLayout>
  );
}

export interface CheckboxControlProps extends BaseFormControlProps {
  value: boolean;
  onChange(value: boolean): void;
}

export function CheckboxControl({
  adornmentIcon,
  value,
  onChange,
  ...props
}: CheckboxControlProps) {
  const id = useId();
  return (
    <FormControlLayout
      adornmentIcon={
        adornmentIcon ?? (value ? "check_box_outline_blank" : "check_box")
      }
      id={id}
      {...props}
    >
      <div
        tabIndex={0}
        className={cls.element("input", null, "checkbox")}
        id={id}
        onClick={() => onChange(!value)}
      >
        {value.toString()}
      </div>
    </FormControlLayout>
  );
}

export interface SelectControlProps<T> extends BaseFormControlProps {
  options: readonly T[];
  getOptionLabel(option: T): string;
  noOptionSelectedLabel: string;
  value: T | null;
  onChange(value: T): void;
}

export function SelectControl<T>({
  adornmentIcon,
  options,
  getOptionLabel,
  noOptionSelectedLabel,
  value,
  onChange,
  ...props
}: SelectControlProps<T>) {
  const id = useId();

  const selectedIndex = value !== null ? options.indexOf(value) : -1;

  return (
    <FormControlLayout
      adornmentIcon={adornmentIcon ?? "list"}
      id={id}
      {...props}
    >
      <select
        className={cls.element("input", null, "select")}
        id={id}
        value={selectedIndex}
        onChange={(e) => {
          const index = Number.parseInt(e.target.value);
          onChange(options[index]);
        }}
      >
        {selectedIndex === -1 && (
          <option value={-1} disabled>
            {noOptionSelectedLabel}
          </option>
        )}
        {options.map((option, i) => (
          <option key={i} value={i}>
            {getOptionLabel(option)}
          </option>
        ))}
      </select>
    </FormControlLayout>
  );
}

export interface ButtonControlProps extends BaseFormControlProps {
  adornmentIcon: string;
  value: string;
  onPress(): void;
}

export function ButtonControl({
  value,
  onPress,
  ...props
}: ButtonControlProps) {
  const id = useId();
  return (
    <FormControlLayout id={id} {...props}>
      <div
        tabIndex={0}
        className={cls.element("input", null, "button")}
        id={id}
        onClick={onPress}
      >
        {value}
      </div>
    </FormControlLayout>
  );
}
