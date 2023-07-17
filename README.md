# Kragle

<!-- The React framework that let's you separate your business logic, UI state, and style props, then compose everything without writing any boilerplate code. -->

A React framework for professional developers to build your business logic in isolation, then compose your app UI with zero boilerplate code.

**[Get started](./doc/01-installation.md)** | **[API docs](./doc/api-reference.md)**

### Case study

Let's look at an example component from an online shop app.
This component renders a single item from the users shopping cart, and lets them remove the item if they no longer want to purchase it.

Here is how that component might be implemented traditionally:

<div style="display: flex">

```ts
function ShoppingCartItem({ item }) {
  const { id, name, quantity, totalPrice } = item;

  const deleteItemMutation = useDeleteItemMutation();
  const deleteItem = useCallback(
    () => deleteItemMutation(id),
    [(id, deleteItemMutation)]
  );

  const { t } = useTranslation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const openDialog = useCallback(() => setDialogOpen(true), []);
  const closeDialog = useCallback(() => setDialogOpen(false), []);

  return (
    <tr>
      <td>{name}</td>
      <td>{t("shopping-cart.item.quantity", { quantity })}</td>
      <td>{t("shopping-cart.item.total-price", { totalPrice })}</td>
      <td>
        <IconButton
          aria-label={t("shopping-cart.item.delete-button")}
          onClick={openDialog}
        >
          <DeleteIcon />
        </IconButton>
        <Dialog open={dialogOpen} onClose={closeDialog}>
          <Typography variant="h6">
            {t("shopping-cart.delete-item-dialog.title")}
          </Typography>
          <Typography variant="body1">
            {t("shopping-cart.delete-item-dialog.description")}
          </Typography>
          <Flex flexDirection="row" justifyContent="end">
            <Button onClick={closeDialog}>
              {t("shopping-cart.delete-item-dialog.cancel-button")}
            </Button>
            <Button
              variant="filled"
              color="danger"
              startIcon={<DeleteIcon />}
              onClick={deleteItem}
            >
              {t("shopping-cart.delete-item-dialog.confirm-button")}
            </Button>
          </Flex>
        </Dialog>
      </td>
    </tr>
  );
}
```

```
.
.
.
⎫
⎪
⎬ 🛠️ business logic
⎪
⎭
.
} 🎨 style props
.
⎫
⎬ 🧵 ui state
⎭
.
.
⎫
⎪
⎬ 🏗️ composition &
⎪ 🎨 style props
⎪
⎪
⎭
} 🧵 ui state
⎫
⎬ 🏗️ composition
⎭
} 🧵 ui state
⎫
⎪
⎬ 🏗️ composition &
⎪ 🎨 style props
⎪
⎪
⎭
} 🧵 ui state
⎫
⎪
⎬ 🏗️ composition &
⎪ 🎨 style props
⎪
⎭
} 🛠️ business logic
⎫
⎪
⎬ 🏗️ composition &
⎪ 🎨 style props
⎪
⎪
⎭
.
.
```

</div>

For comparison, here is the same component implemented with Kragle:

```ts
function ShoppingCartItemBloc({ item, slots, OutputsProvider }) {
  const { id, name, quantity, totalPrice } = item;

  const deleteItemMutation = useDeleteItemMutation();
  const deleteItem = useCallback(
    () => deleteItemMutation(id),
    [(id, deleteItemMutation)]
  );

  return (
    <OutputsProvider deleteItem={deleteItem}>
      <slots.Child />
    </OutputsProvider>
  );
}
```

_Wait, what happened to the JSX?_

The code you want to focus on during development, debugging and review is the business logic.
But often times, component composition code and style props make up the overwhelming part of your component files, creating noise and distracting from the relevant lines of code.

Kragle is built around a key observation: Unlike business logic code, component composition code is very standardized – so much so that it can easily be auto-generated.
All you need is a way to describe your UI structure to the code generator.

And that's where the Kragle editor comes into play.
The editor is a core part of the framework that let's you compose and style your existing React components into pages and views.

<div style="height: 500px; background-color: #eee; display: grid; place-items: center">image placeholder</div>

The editor generates standard React code – here's an [example output](./packages/@pschiffmann/kragle-demo/kragle/scenes/article-management/scene.tsx).
The generated file exports a React component that you can import and render anywhere in your app.
The component has the exact same behaviour as hand-written code, but you save yourself the tedious typing work, and keep your business logic free from UI clutter.

### Kragle at a glance

Kragle is ...

- An API layer for building isolated components.
  Declare schemas for your components that describe the component inputs and outputs – i.e. what data must be passed into your component through props, and what data your component exposes to its subtree (through an `<OutputsProvider />`).
- A no-code editor to compose components.
  Compose your components into pages, views, or even new reusable components.
  Configure all style props inside the editor to keep your hand-written files clutter free: colors, font styles, margins and positions, labels, and translations.
- Fully type safe.
  Inside the schemas you define types for your inputs and outputs, and the editor will ensure that you only assign compatible values to a component input.
  The schema doubles as a component props interface, so schema and component will always be in sync.
- Compatible with the tools you know and love.
  Use any React package, any build tool, SSR.
- Incrementally adoptable.
  You can migrate existing apps one page, view or component at a time.
- Built for professional development workflows.
  Scenes are saved as tsx files and stored in your git repository.
  The generated code uses the schema types as well, so TypeScript will detect breaking changes in your generated scenes after you edit a schema or update an npm package.

Check out the **[tutorial](./doc/01-installation.md)** to learn how Kragle works in detail.

## Pricing and license terms

Refer to the [license](./LICENSE) for full details, but here is a quick summary.

### For app developers

Kragle is free to use for for personal use and open source projects.
You may also install and try out Kragle for evaluation purposes.

If you use Kragle in a commercial product, each developer on your team that uses the Kragle Editor must [purchase a license](TODO).
Licenses come with 12 months of updates from the date of purchase.
You may continue to use all versions of Kragle that were released during that time period, but upgrading to later Kragle versions requires a new license.

Both community and commercial license allow you to ship generated scene code to production.
However, you're not permitted to ship code to production that was imported from `@kragle/runtime` – like `NodeSchema` and `t.Type`.
Refer to the [docs](./docs/01-installation.md) to learn how you can configure your bundler to exclude these files from production builds.

### For npm package authors

Building reusable Kragle nodes, types and libraries and publishing them as npm packages is free.
You can publish your package under any license you like, be it open source or for-profit.

When bundling your package code before publishing, make sure that your bundle doesn't include code from `@kragle/runtime` – like `NodeSchema` or `t.Type`.
Instead, your code may only include import statements to the `@kragle/runtime` package.
Refer to the [docs](./docs/01-installation.md) to learn how you can configure your bundler to exclude these files from production builds.

## Contributing

The best way you can contribute to the project right now is by sharing your feedback with us.
Please tell us about anything you're unhappy with – everything from minor inconveniences to full showstoppers.
Browse our [Github issue tracker](https://github.com/pschiffmann/kragle.ts/issues) and upvote issues (by responding with 👍), comment your own requirements and ideas, or open a new issue.

If you want to contribute code or documentation, that awesome!
But before you start working on a PR, please talk to us first.
For local development and debugging, follow the setup instructions [here](https://github.com/pschiffmann/kragle.ts/blob/main/doc/local-development.md).
