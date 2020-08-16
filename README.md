# Instrument Catalog — frontend

## Project setup

- Clone the repository
  ```bash
  $ git clone $REPO_URL
  $ cd /path/to/instrument-catalog-frontend
  ```
- Install dependencies
  ```bash
  # Use *one* of the following:
  $ npm ci      # Either exact versions from package-lock.json
  $ npm install # Or recalculate the dependency tree using package.json
  ```

## Scripts for local development

- **`$ npm run lint`** - Report linting issues.
- **`$ npm run lint:fix`** - Automatically fix some linting issue. Right now, this is just running [prettier](https://prettier.io/). Prettier is also run via a git hook when committing changes.
- **`$ npm start`** - Start the dev server (with hot reloading).
- **`$ npm run stage`** - Build the site, placing all files in the `dist/` directory. This is almost the same as the `build` script, but is functional when served on `localhost`.
- **`$ npm run build`** - Build the site, including links with absolute paths referencing the configured production host name. Serving this from `localhost` will _not_ work.
- **`$ npm run serve`** - Serve whatever is in the `dist/` directory over `localhost`.
