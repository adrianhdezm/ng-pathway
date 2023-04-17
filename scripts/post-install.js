const fs = require('fs');
const path = require('path');

const templatesPath = path.join(__dirname, '..', 'lib', 'templates');
const projectRootPath = path.join(__dirname, '..', '..', '..');

// Only execute the script if the project root is npm package
if (fs.existsSync(path.join(projectRootPath, 'package.json'))) {
  const ngPathwayPath = path.join(projectRootPath, '.ngpathway');

  // Create the .ngpathway directory
  if (!fs.existsSync(ngPathwayPath)) {
    fs.mkdirSync(ngPathwayPath);
  }

  // Copy the types.d.ts file
  const typesFileContent = fs.readFileSync(path.join(templatesPath, 'types.d.ts.hbs'), 'utf-8');
  fs.writeFileSync(`${ngPathwayPath}/types.d.ts`, typesFileContent);

  // Copy the routes.ts file
  const routesFileContent = fs.readFileSync(path.join(templatesPath, 'routes.ts.hbs'), 'utf-8');
  fs.writeFileSync(`${ngPathwayPath}/routes.ts`, routesFileContent);

  try {
    // Adapt Nx Project project.json
    const nxProjectJsonPath = path.join(projectRootPath, 'project.json');
    if (fs.existsSync(nxProjectJsonPath)) {
      const nxProjectJson = JSON.parse(fs.readFileSync(nxProjectJsonPath, 'utf-8'));

      // Change build
      nxProjectJson.targets.build.executor = '@nrwl/angular:webpack-browser';
      nxProjectJson.targets.build.options.customWebpackConfig = {
        path: 'node_modules/ngpathway/lib/config/webpack.config.js'
      };

      // Change
      nxProjectJson.targets.serve.executor = '@nrwl/angular:webpack-dev-server';

      // Write the file
      fs.writeFileSync(nxProjectJsonPath, JSON.stringify(nxProjectJson, null, 2) + '\n');
    }

    // Adapt Ts Config for App
    const tsConfigAppPath = path.join(projectRootPath, 'tsconfig.app.json');
    if (fs.existsSync(tsConfigAppPath)) {
      const tsConfigApp = JSON.parse(fs.readFileSync(tsConfigAppPath, 'utf-8'));

      // Extend includes
      const include = tsConfigApp.include;
      if (Array.isArray(include)) {
        tsConfigApp.include = [...include, '.ngpathway/router/**/*.ts', '.ngpathway/types.d.ts'];

        // Write the changes
        fs.writeFileSync(tsConfigAppPath, JSON.stringify(tsConfigApp, null, 2) + '\n');
      }
    }
  } catch (error) {
    // fail silenly
    console.warn(error);
  }
}
