# Instrument Catalog — frontend

![Tests](https://github.com/noahbrenner/instrument-catalog-frontend/workflows/Tests/badge.svg)

Instrument Catalog is a React web app for sharing knowledge of musical instruments. Logged-in users can create public pages for their favorite instruments, and later edit or delete any page they created.

The app is written in TypeScript with React function components and hooks. It includes:

- Testing with [Jest](https://jestjs.io/) & [React Testing Library](https://testing-library.com/docs/react-testing-library/intro) and linting/formatting with [ESlint](https://eslint.org/), [Prettier](https://prettier.io/), and [TypeScript](https://www.typescriptlang.org/), all run via CI.
- Static rendering & hydration with [react-static](https://github.com/react-static/react-static).
- User authentication with [Auth0](https://auth0.com/), including support for admin users.
- A mock API server in dev/test using [Mock Service Worker](https://mswjs.io/), which enables frontend development independently of the backend.

The backend API server is in a separate repo: <https://github.com/noahbrenner/instrument-catalog-backend>

## Dependencies

- [Node.js](https://nodejs.org/) (and [`npm`](https://www.npmjs.com/get-npm), which is bundled with Node)

## Project setup

- Clone the repository
  ```bash
  $ git clone $REPO_URL
  $ cd /path/to/instrument-catalog-frontend
  ```
- Install `npm` dependencies
  ```bash
  # Use *one* of the following:
  $ npm ci      # Use exact versions from package-lock.json
  $ npm install # Use newest versions of (sub)dependencies allowed by package.json
  ```
- Create `.env` by copying `template.env`
  ```bash
  $ cp template.env .env
  # Then edit `.env` to set environment variables as needed
  ```
- Enable login functionality _(Optional, but the site is read-only without it)_
  - Create an [Auth0](https://auth0.com/) account. They have a substantial free tier, so you shouldn't get any charges for testing out the app.
    - Create a new Tenant within your account (this happens automatically if you're creating a new Auth0 account)
    - Create a new Application for that Tenant and set its **Application Type** to "Single Page Application"
      - In your new Application's settings, enter `http://localhost:5000` in all of the following fields _(**NOTE:** if you didn't set the `FRONTEND_DEVSERVER_PORT` env var to `5000`, use the port you chose instead)_:
        - `Allowed Callback URLs`
        - `Allowed Logout URLs`
        - `Allowed Web Origins`
      - Back in the repo, open up the `.env` file and enter your Auth0 Application's **Domain** and **Client ID** as the values of `AUTH0_DOMAIN` and `AUTH0_CLIENT_ID`, respectively.
    - Then, to create a new API definition representing the backend server:
      - In the Auth0 dashboard's sidebar, click "APIs", then click the "CREATE API" button
      - Choose a Name, Identifier, and Signing Algorithm. Choose any values you like, just note that the Identifier can't be changed and it will be included with the frontend code.
      - Back in the repo, edit the `.env` file and enter your chosen **API Identifier** as the value of `AUTH0_BACKEND_API_IDENTIFIER`
  - _(Optional)_ Give yourself admin access. This allows you to edit or delete _any_ instrument on the site, not only the ones you create. You must complete the steps above before you can do this.
    - First, to give yourself the "admin" role within Auth0:
      - Start up the dev server (`npm start`), go to <http://localhost:5000>, and log into the app in order to create a User record within Auth0
      - In the Auth0 dashboard's sidebar, click "Users & Roles" > "Roles"
        - Create a role named "admin" (lower case, no quotes)
      - In the Auth0 dashboard's sidebar, click "Users & Roles" > "Users"
        - Find yourself in the user list, click the `...` button on the right side of that row, and select "Assign Roles"
        - Select the admin role and assign it
    - Next, to make Auth0's server insert the array of a user's roles in each idToken (so we can read them from the frontend app):
      - In the Auth0 dashboard's sidebar, click "Rules"
      - Click the "CREATE RULE" button
      - Click "Empty rule" and enter the following:
        <!-- prettier-ignore -->
        ```javascript
        function includeUserRoles(user, context, callback) {
          const roles = (context.authorization && context.authorization.roles) || [];
         
          // Auth0 requires the namespace to start with http: or https:
          const namespace = "http:auth";
          context.idToken[`${namespace}/roles`] = roles; // For the frontend to read
          context.accessToken[`${namespace}/roles`] = roles; // For the backend to read
         
          return callback(null, user, context);
        }
        ```
    - Now that you have an admin account, it's a good idea to create an additional account on the dev site _without_ the admin role so that you can easily view the site as a regular user.

## Scripts for local development

- Linting/Testing
  - **`$ npm test`** - Run all tests using [Jest](https://jestjs.io/).
    - Run tests in watch mode with: **`$ npm test -- --watch`**
    - Run and watch only test files matching a RegExp: **`$ npm test -- --watch mypattern`**
  - **`$ npm run lint`** - Run all linters. Each can also be run individually:
    - **`$ npm run lint:lint`** - Lint codebase using [ESlint](https://eslint.org/).
      - Some linting issues can be fixed automatically with: **`$ npm run lint:lint -- --fix`**
    - **`$ npm run lint:types`** - Run static type checking for [TypeScript](https://www.typescriptlang.org/) files.
    - **`$ npm run lint:format`** - Verify that formatting is consistent using [Prettier](https://prettier.io/).
  - **`$ npm run format`** - Reformat code using Prettier.
    - _Prettier is also run (via a git hook) whenever you make a commit._
- Building
  - **`$ npm start`** - Start the dev server (with hot reloading).
  - **`$ npm run stage`** - Build the site, placing all files in the `dist/` directory. This is almost the same as the `build` script, but the site is functional when served on `localhost`.
  - **`$ npm run build`** - Build the site for production. Links will have absolute paths referencing the configured production host name and base path. Serving this from `localhost` will _not_ work.
  - **`$ npm run serve`** - Serve whatever is in the `dist/` directory over `localhost`.
    - This script doesn't build the site, it only serves existing files. To (re)build and serve the site, just run both tasks:
      ```bash
      $ npm run stage && npm run serve
      ```
    - By default, the site is served on port 5000 (`localhost:5000`)
    - You can optionally listen on a different port
      - ...either with a command line flag: **`$ npm run serve -- -l 3000`** _(that's dash "ell" for "listen")_
      - ...or with an environment variable: **`$ PORT=3000 npm run serve`** _(setting `PORT` in `.env` does **not** work)_

## Deployment

- Update your Auth0 Application's settings to reflect the domain that the site will be served from, replacing the `localhost:5000` values.
- In the Auth0 dashboard, update your Application's settings to reflect the domain that the site will be served from (thus replacing the values set to `localhost:5000` when following the [Project setup](#project-setup) instructions).
  - Or even better, create a new Auth0 Application for the deployed site so that you can keep using the original in development.
- Set env vars: When building the site for deployment, some environment variables need to be set (**see `template.env` for reference**).
  - If you're building on your local machine, you can just set the values in `.env`.
  - If building and deploying from a CI/CD server, use the CD platform's interface to set the required variables.
- Build the site using **`$ npm run build`**, then deploy the contents of the `dist/` directory.
