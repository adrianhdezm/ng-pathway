import glob from 'glob';
import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';
import { Route, RouteFile } from './types';
import { extractFolders, getBaseUrl, removeFileExtension } from './utils/path.utils';
import {
  buildFolderTreeFromHierarchy,
  flattenRoutes,
  generateFolderHierarchy,
  handleLayoutNodesInGraph,
  mapNodesToRoutes
} from './utils/graph.utils';

// Construct the path to the Handlebars template file
const templatePath = path.join(__dirname, 'templates');

export function routesBuilder(pagesPattern: string): RouteFile[] {
  const filePaths = glob.sync(pagesPattern);
  const baseUrl = getBaseUrl(filePaths);

  // Extract Folders from Files Paths
  const folderPaths = extractFolders(filePaths);

  // Map Folders to Nodes with attributes Path, Parent, and Files
  const folderNodes = generateFolderHierarchy(folderPaths, baseUrl, filePaths);

  // Apply Filter to remove Folders without Files
  const filteredFolderNodes = folderNodes.filter((folderNode) => folderNode.files.length > 0);

  // Build Folder Tree From Folder Hierarchy - Create the Routes Graph
  const routeGraph = buildFolderTreeFromHierarchy(filteredFolderNodes);

  // Handle Layout Nodes from Routes Graph
  const routeGraphWithoutLayoutNodes = handleLayoutNodesInGraph(routeGraph);

  // Map nodes to Angular route properties
  const routeGraphForAngularRouter = mapNodesToRoutes(routeGraphWithoutLayoutNodes);

  // Map to route files

  // Read the Handlebars template from a file
  const childRoutesPartial = fs.readFileSync(path.join(templatePath, 'child-routes.hbs'), 'utf8');
  const indexTemplateSource = fs.readFileSync(path.join(templatePath, 'index.route.hbs'), 'utf8');

  // Compile the Handlebars template
  Handlebars.registerPartial('childRoutes', childRoutesPartial);
  const indexTemplate = Handlebars.compile<{
    routes: Route[];
    componentImports: { file: string; component: string }[];
    providersImports: { file: string; providers: string }[];
  }>(indexTemplateSource);

  const routeFiles = routeGraphForAngularRouter.map((node) => {
    if (node.route === '') {
      return {
        path: '',
        fileName: 'index.ts',
        fileContent: indexTemplate({
          routes: [node],
          componentImports: node.file ? [{ file: removeFileExtension(node.file as string), component: node.component as string }] : [],
          providersImports: node.providersFile
            ? [{ file: removeFileExtension(node.providersFile as string), providers: node.providers as string }]
            : []
        })
      };
    } else {
      const componentImports = flattenRoutes(node.children)
        .filter(({ file, component }) => file !== undefined && component !== undefined)
        .map(({ file, component }) => ({ file: removeFileExtension(file as string), component: component as string }));

      const providersImports = flattenRoutes(node.children)
        .filter(({ providersFile, providers }) => providersFile !== undefined && providers !== undefined)
        .map(({ providersFile, providers }) => ({ file: removeFileExtension(providersFile as string), providers: providers as string }));

      const fileContent = indexTemplate({ routes: node.children, componentImports, providersImports });

      return {
        path: node.route,
        fileName: `${node.route}.index.ts`,
        fileContent
      };
    }
  });

  return routeFiles;
}
