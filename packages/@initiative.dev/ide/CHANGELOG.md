# CHANGELOG

## 0.1.10 - 2024-02-14

- IDE style fix.

## 0.1.9 - 2024-02-14

- Add node copy&paste.
- Add error indicator in the node tree view.
- Fix code gen for empty collection slots.

## 0.1.8 - 2024-01-31

- Fix bug that generated wrong Fluent keys.

## 0.1.7 - 2024-01-25

- Add basic support for regular scene slots.
  These can't be configured in the IDE, but if created manually in a scene.json file, code-gen will work.

## 0.1.6 - 2024-01-20

- Add support for `StyleProps` from `@initiative.dev/schema`.

## 0.1.5 - 2023-12-27

- Extract `slots` object literal into top-level variables, to so they no longer break memoization.

## 0.1.4 - 2023-12-25

- Fix error that prevented code gen for slot nodes.
- Fix off-by-one error in generated `.ftl` files.

## 0.1.3 - 2023-12-25

- Adapter components in generated `scene.tsx` files are wrapped with React `memo()`.

## 0.1.2 – 2023-10-22

- Remove top-level await from license validation.

## 0.1.1 – 2023-10-21

- Fix erroneous escapes for fluent messages.
- Add `<Editor projectId="...">` prop.

## 0.1.0 – 2023-10-21

- Initial release.
