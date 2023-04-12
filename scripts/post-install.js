const fs = require('fs');
const path = require('path');

const templatesPath = path.join(__dirname, '..', 'lib', 'templates');
const projectRootPath = path.join(__dirname, '..', '..', '..');
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
