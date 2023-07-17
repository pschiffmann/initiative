## Use your own package name for the namespace

## Avoid no-op inputs

MUI Button -> variant="contained" + disableElevation

## Don't expose DOM details

## Don't expose appearance options as inputs that should be set globally

## Use node composition sparingly

For example, some React component libraries implement tooltips as a separate component that wraps the tooltip trigger element, like so:

```ts
<Tooltip title="Delete">
  <IconButton icon="delete_outlined" />
</Tooltip>
```
