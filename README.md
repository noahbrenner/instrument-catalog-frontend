# Instrument Catalog — frontend

![Tests](https://github.com/noahbrenner/instrument-catalog-frontend/workflows/Tests/badge.svg)

## Dependencies

- [Node.js](https://nodejs.org/) (and [`npm`](https://www.npmjs.com/get-npm), which is bundled with it)

## Project setup

- Clone the repository
  ```bash
  $ git clone $REPO_URL
  $ cd /path/to/instrument-catalog-frontend
  ```
- Install `npm` dependencies
  ```bash
  # Use *one* of the following:
  $ npm ci      # Either exact versions from package-lock.json
  $ npm install # Or recalculate the dependency tree using package.json
  ```
- Create `.env` by copying `template.env`
  ```bash
  $ cp template.env .env
  # Then edit `.env` as needed
  ```

## Scripts for local development

- Linting/Testing
  - **`$ npm test`** - Run all tests using [Jest](https://jestjs.io/) and [Testing Library](https://testing-library.com/).
    - Run tests in watch mode with: **`$ npm test -- --watch`**
  - **`$ npm run lint:lint`** - Lint codebase using [ESlint](https://eslint.org/).
    - Some linting issues can be fixed automatically with: **`$ npm run lint:lint -- --fix`**
  - **`$ npm run lint:types`** - Run static type checking for [TypeScript](https://www.typescriptlang.org/) files.
  - **`$ npm run lint:format`** - Verify that formatting is consistent using [Prettier](https://prettier.io/).
  - **`$ npm run lint`** - Run all of the above linters.
  - **`$ npm run format`** - Reformat code using Prettier.
    - _Prettier is also run (via a git hook) whenever you make a commit._
- Building
  - **`$ npm start`** - Start the dev server (with hot reloading).
  - **`$ npm run stage`** - Build the site, placing all files in the `dist/` directory. This is almost the same as the `build` script, but the site is functional when served on `localhost`.
  - **`$ npm run build`** - Build the site for production. Links will have absolute paths referencing the configured production host name and base path. Serving this from `localhost` will _not_ work.
  - **`$ npm run serve`** - Serve whatever is in the `dist/` directory over `localhost`.
    - By default, the site is served on port 5000 (`localhost:5000`)
    - You can optionally listen on a different port
      - ...either with a command line flag: **`$ npm run serve -- -l 3000`** _(that's dash "ell" for "listen")_
      - ...or with an environment variable: **`$ PORT=3000 npm run serve`**
    - This script doesn't build the site, it only serves existing files. To (re)build and serve the site, just run both tasks:
      ```bash
      $ npm run stage && npm run serve
      ```

## Deployment

When building the site for deployment, some environment variables need to be set (**see `template.env` for reference**).

- If you're building on your local machine, you can just set the values in `.env`.
- If building and deploying from a CD server, use the CD platform's interface to set the required variables.

Build the site using **`$ npm run build`**, then deploy the contents of the `dist/` directory.
