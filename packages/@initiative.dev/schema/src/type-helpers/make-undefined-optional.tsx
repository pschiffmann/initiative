/**
 * Turns `{ p: undefined }` into `{ p?: undefined; }`.
 */
export type MakeUndefinedOptional<record extends {}> = Pick<
  record,
  RequiredKeys<record>
> &
  Partial<record>;

/**
 * Returns the keys of `T` that don't accept `undefined` as a value.
 */
type RequiredKeys<record extends {}> = {
  [key in keyof record]: undefined extends record[key] ? never : key;
}[keyof record];
