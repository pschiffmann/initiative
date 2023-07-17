# Local development

## Starting the local development server

1.  Install a recent version of Node.js.
    We have not tested compatibility with a wide range of Node.js versions, at the time of writing this I'm using v19.0.0.
2.  Clone this repository.
3.  In the repository root directory, run `npm install`.
    This repository uses [npm workspaces](https://docs.npmjs.com/cli/v9/using-npm/workspaces) to manage the dependencies of contained npm packages.
4.  Open a new terminal and run the Sass compiler in the `@kragle/editor` package.
    ```bash
    cd packages/@kragle/editor
    npm run sass
    ```
    If you're making changes to the scss files in `@kragle/design-system` or `@kragle/editor`, keep this process running.
    Else, you can cancel it after the files have been compiled once; compiled files are written to disk in the `dist/` directory.
5.  Open a new terminal and run the TypeScript compiler in the `@pschiffmann/kragle-demo` package.
    ```bash
    cd packages/@pschiffmann/kragle-demo
    npm run tsc
    ```
    Keep this process running; it uses [TypeScript project references](https://www.typescriptlang.org/docs/handbook/project-references.html) to compile all `@kragle/*` packages as well.
    Compilation results are written to disk into the `dist/` directories inside the respective packages.
6.  Open a new terminal and start the development server in the `@pschiffmann/kragle-demo` package.
    ```bash
    cd packages/@pschiffmann/kragle-demo
    npm run dev
    ```
    Open [http://localhost:5173/kragle/editor.html]() to use the Kragle editor, or [http://localhost:5173/]() to see a Kragle code-gen scene.

## Publishing

TODO
