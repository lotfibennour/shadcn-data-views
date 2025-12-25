# How to Publish `shadcn-data-views` to NPM

Follow these steps to publish your package to the npm registry.

## Prerequisites
1.  **NPM Account**: You need an account on [npmjs.com](https://www.npmjs.com/).
2.  **Login**: Login to npm in your terminal.
    ```bash
    npm login
    ```

## Publishing Steps

1.  **Build the Package**: Ensure you have the latest build.
    ```bash
    pnpm run build-lib
    ```

2.  **Versioning**: Update the version number in `package.json` if needed.
    ```bash
    npm version patch # or minor, major
    ```

3.  **Publish**: Run the publish command.
    ```bash
    npm publish --access public
    ```
    *Note: The `--access public` flag is required if your package is scoped (e.g. `@yourusername/package`). Since this package is currently named `shadcn-data-views` (unscoped), it defaults to public, but adding the flag doesn't hurt.*

## Verification
Visit `https://www.npmjs.com/package/shadcn-data-views` to see your live package.
