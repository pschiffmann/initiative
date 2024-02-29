import { ReactNode, useEffect, useId, useRef } from "react";
import { bemClasses } from "../util/bem-classes.js";
import { IconButton } from "./icon-button.js";
import { MaterialIcon } from "./material-icon.js";
import { Any } from "../../../../../schema/src/type-system/any.js";

const cls = bemClasses("initiative-form-control");

export interface BaseFormControlProps {
  label: string;
  helpText?: string;
  errorText?: string;
  adornmentIcon?: string;
  dense?: boolean;
  emphasized?: boolean;
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
  dense,
  emphasized,
  onClear,
  id,
  className,
  children,
}: FormControlLayoutProps) {
  return (
    <div
      className={cls.block(
        className,
        dense && "dense",
        emphasized && "emphasized",
        !!errorText && "error",
      )}
    >
      <div className={cls.element("header")}>
        <label className={cls.element("label")} htmlFor={id} title={label}>
          {label}
        </label>
        {errorText ? (
          <MaterialIcon
            className={cls.element("help-icon", null, "error")}
            icon="warning_amber"
            title={helpText ? `${helpText}\n\n${errorText}` : errorText}
          />
        ) : helpText ? (
          <MaterialIcon
            className={cls.element("help-icon")}
            icon="help_outline"
            title={helpText}
          />
        ) : null}
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

export interface TextFieldControlProps
  extends BaseFormControlProps,
    Omit<TextFieldProps, "id"> {}

export function TextFieldControl({
  adornmentIcon,
  ...props
}: TextFieldControlProps) {
  const id = useId();
  return (
    <FormControlLayout
      adornmentIcon={adornmentIcon ?? "text_fields"}
      id={id}
      {...props}
    >
      <TextField id={id} {...props} />
    </FormControlLayout>
  );
}

/**
 * @id used when accessed by Control
 */
export interface TextFieldProps {
  value: string;
  onChange?(value: string): void;
  id?: string;
}

export function TextField({ value, onChange, id }: TextFieldProps) {
  return (
    <input
      type="text"
      className={cls.element("input", null, "text-field")}
      id={id}
      readOnly={!onChange}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
    />
  );
}

export function TextAreaControl({
  adornmentIcon,
  ...props
}: TextFieldControlProps) {
  const id = useId();
  return (
    <FormControlLayout
      adornmentIcon={adornmentIcon ?? "subject"}
      id={id}
      {...props}
    >
      <TextArea id={id} {...props} />
    </FormControlLayout>
  );
}

export function TextArea({ value, onChange, id }: TextFieldProps) {
  return (
    <div className={cls.element("input", null, "text-area")}>
      <textarea
        className={cls.element("textarea")}
        id={id}
        readOnly={!onChange}
        rows={value.split("\n").length}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  );
}

export interface NumberFieldControlProps
  extends BaseFormControlProps,
    Omit<NumberFieldProps, "id"> {}

export function NumberFieldControl({
  adornmentIcon,
  ...props
}: NumberFieldControlProps) {
  const id = useId();

  return (
    <FormControlLayout
      adornmentIcon={adornmentIcon ?? "numbers"}
      id={id}
      {...props}
    >
      <NumberField id={id} {...props} />
    </FormControlLayout>
  );
}

/**
 * @id used when accessed by Control
 */
export interface NumberFieldProps {
  value: number;
  onChange(value: number): void;
  id?: string;
}

export function NumberField({ value, onChange, id }: NumberFieldProps) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    ref.current!.value = `${value}`;
  }, [value]);

  return (
    <input
      ref={ref}
      type="number"
      className={cls.element("input", null, "number-field")}
      id={id}
      defaultValue={value}
      onChange={(e) => {
        const value = e.target.value;
        if (value.match(floatPattern)) onChange?.(Number.parseFloat(value));
      }}
    />
  );
}

const floatPattern = /\d+(?:\.\d+)?/;

export interface CheckboxControlProps
  extends BaseFormControlProps,
    Omit<CheckboxProps, "id"> {}

export function CheckboxControl({
  adornmentIcon,
  value,
  ...props
}: CheckboxControlProps) {
  const id = useId();
  return (
    <FormControlLayout
      adornmentIcon={
        adornmentIcon ?? (value ? "check_box" : "check_box_outline_blank")
      }
      id={id}
      {...props}
    >
      <Checkbox value={value} id={id} {...props} />
    </FormControlLayout>
  );
}

/**
 * @id used when accessed by Control
 */
export interface CheckboxProps {
  value: boolean;
  onChange(value: boolean): void;
  id?: string;
}

export function Checkbox({ value, onChange, id }: CheckboxProps) {
  return (
    <button
      className={cls.element("input", null, "checkbox")}
      id={id}
      onClick={() => onChange(!value)}
    >
      {value.toString()}
    </button>
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
        className={cls.element(
          "input",
          null,
          "select",
          value === null && "no-value",
        )}
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

export interface ButtonControlProps
  extends BaseFormControlProps,
    Omit<ButtonProps, "id"> {
  adornmentIcon: string;
}

export function ButtonControl({ ...props }: ButtonControlProps) {
  const id = useId();
  return (
    <FormControlLayout id={id} {...props}>
      <Button id={id} {...props} />
    </FormControlLayout>
  );
}

/**
 * @id used when accessed by Control
 */
export interface ButtonProps {
  value: string;
  onPress?(): void;
  id?: string;
}

export function Button({ value, onPress, id }: ButtonProps) {
  return (
    <button
      className={cls.element("input", null, "button")}
      id={id}
      title={value}
      onClick={onPress}
    >
      {value}
    </button>
  );
}
