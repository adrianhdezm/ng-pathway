import * as fs from 'fs';
import * as path from 'path';
import * as webpack from 'webpack';
import { routesBuilder } from '../index';
import { emptyDirSync } from '../utils/file.utils';

module.exports = (config: webpack.Configuration) => {
  const projectRoot = config.context || '';
  const ngpathwayRouterPath = path.join(projectRoot, '.ngpathway', 'router');

  // Delete all content inside the router directory
  emptyDirSync(ngpathwayRouterPath);

  // Create ngpathwayRouterPath
  fs.mkdirSync(ngpathwayRouterPath);

  const pagesPath = 'src/pages';
  const pattern = `${pagesPath}/**/[a-z]*.ts`;

  const files = routesBuilder(pattern);

  // Create the file inside the folder
  for (const { fileName, fileContent } of files) {
    fs.writeFileSync(`${ngpathwayRouterPath}/${fileName}`, fileContent);
  }

  const ROUTES = files.map(({ path, fileName }) => ({ path, module: `${fileName}` }));

  if (!config.plugins) {
    config.plugins = [];
  }
  config.plugins.push(new webpack.DefinePlugin({ __ROUTES__: JSON.stringify(ROUTES) }));

  return config;
};
