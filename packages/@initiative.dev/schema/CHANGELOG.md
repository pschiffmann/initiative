# CHANGELOG

## 0.1.7 – 2024-01-25

- Bugfix: Add validations around node ids, node schema input and output names.
  The names already caused bugs at runtime and during code-gen, now we issue a warning to the developer during schema instantiation or scene creation.

## 0.1.6 - 2024-01-20

- Export interface `StyleProps`.
- Node components extend `StyleProps`.

## 0.1.3 - 2023-12-25

- Add ExtensionMethodSchema name validation.

## 0.1.0 – 2023-10-21

- Initial release.
