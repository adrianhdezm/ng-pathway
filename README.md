# NgPathway

`NgPathway` is a file-based router utilities library for Angular applications. It simplifies the process of creating and managing routes in your Angular app by allowing you to organize your routes in a directory structure that mirrors your application's UI structure.

## Features

- File-based routing: `NgPathway` helps to use file-based routing to create clear and concise routes to your data, making it easy to navigate and manage large datasets.

## Requisites

- `NgPathway` requires Angular 15+. All tests were carried out using the standalone components approach.
- You can use Nx Angular Standalone Project or Angular CLI with `@angular-builders/custom-webpack`.

## Installation

To get started with `NgPathway`, simply install the library using NPM:

```bash
npm install ngpathway --save
```

After the installation, a new folder called `.ngpathway` is created in the project's root directory. This folder initially contains two files: `routes.ts` and `types.d.ts`. Later, it will generate Angular routes inside a folder called `router`.

Next, you need to register the `types.d.ts` and `router` folder in your `tsconfig.app.json`. For example:

```json
"include": [
  ".ngpathway/types.d.ts",
  ".ngpathway/router/**/*.ts"
]
```

After this, you need to add the webpack configuration to your `angular.json` or `project.json` by replacing the `executor` in the `build` and `serve` sections. For example, in an Nx workspace, the configuration should be adapted as shown in the following code snippet:

```json
"build": {
    "executor": "@nrwl/angular:webpack-browser",
    "options": {
        ... other options
        "customWebpackConfig": {
            "path": "node_modules/ngpathway/lib/config/webpack.config.js"
        }
},

"serve": {
    "executor": "@nrwl/angular:webpack-dev-server",
}

```

To avoid conflicting with different webpack versions is recommended you run: `npm dedupe`. For more information the explanation (here)[https://stackoverflow.com/questions/76000975/nx-angular-project-build-failed-after-upgrading-to-webpack-5-79-0]

## Usage

To use NgPathway, create a directory called `pages` inside your application sources (e.g., `src` directory). Include the content of this file in your `tsconfig.app.json`. For example:

```json
"include": [
  "src/pages/**/*.ts"
]
```

`NgPathway` maps the pages folder hierarchy to Angular routes. For example:

`NgPathway` will map the `pages` folders hierarchy to angular routes. For example:

- pages/ -> /
- pages/teams -> /teams
- pages/teams/[id] -> /teams/:id

Inside each folder, you can create a Angular Component, the route providers, and matchers. `NgPathway` automatically generates the route structure for you in a file routes.ts inside the `.ngpathway` folder. Then, you can import this file in your `main.ts`. For example:

```ts
import { routes } from '../.ngpathway/routes';

bootstrapApplication(AppComponent, {
  providers: [provideRouter(routes, withEnabledBlockingInitialNavigation())]
}).catch((err) => console.error(err));
```

Then you are ready to continue creating new routes in the `pages` folder, and `NgPathway` will automatically generate the corresponding files.

## Contributing

If you're interested in contributing to NgPathway, please feel free to submit a pull request or open an issue on GitHub. We welcome all contributions and feedback!

## License

`NgPathway` is licensed under the MIT license. See the LICENSE file for more information.
