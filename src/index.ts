import glob from 'glob';
import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';
import { Route, RouteFile } from './types';
import { extractFolders, getBaseUrl, removeFileExtension } from './utils/path.utils';
import {
  addAngularRouteToGraphNodes,
  addCorrectComponentFileToGraphNodes,
  buildFolderTreeFromHierarchy,
  filterFilesFromNodeWithChildren,
  flattenRoutes,
  generateFolderHierarchy,
  handleLayoutNodesInGraph,
  mapNodes,
  mapNodesToRoutes
} from './utils/graph.utils';
import { computeComponentName, isString } from './utils/string.utils';

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

  //Add Angular Route property to Nodes in Routes Graph
  const routeGraphWithAngularRoute = addAngularRouteToGraphNodes(routeGraph);

  //Remove files from Nodes with children in Routes Graph
  const routeGraphWithFilteredFiles = filterFilesFromNodeWithChildren(routeGraphWithAngularRoute);

  //Add correct component file property to Nodes in Routes Graph
  const routeGraphWithFile = addCorrectComponentFileToGraphNodes(routeGraphWithFilteredFiles);

  // Handle Layout Nodes from Routes Graph
  const routeGraphWithoutLayoutNodes = handleLayoutNodesInGraph(routeGraphWithFile);

  // Compute Component Name from File Path
  const routeGraphWithComponentName = mapNodes(routeGraphWithoutLayoutNodes, (node) => {
    const { data } = node;
    return {
      ...node,
      data: {
        ...data,
        component: isString(data.file) ? computeComponentName(data.file as string) : undefined
      }
    };
  });

  // Keep only angular route relevant properties
  const routeGraphForAngularRouter = mapNodesToRoutes(routeGraphWithComponentName);

  // Map to route files

  // Read the Handlebars template from a file
  const childRoutesPartial = fs.readFileSync(path.join(templatePath, 'child-routes.hbs'), 'utf8');
  const indexTemplateSource = fs.readFileSync(path.join(templatePath, 'index.route.hbs'), 'utf8');

  // Compile the Handlebars template
  Handlebars.registerPartial('childRoutes', childRoutesPartial);
  const indexTemplate = Handlebars.compile<{ routes: Route[]; fileImports: { file: string; component: string }[] }>(indexTemplateSource);

  const routeFiles = routeGraphForAngularRouter.map((node) => {
    if (node.route === '') {
      return {
        path: '',
        fileName: 'index.ts',
        fileContent: indexTemplate({
          routes: [node],
          fileImports: [{ file: removeFileExtension(node.file as string), component: node.component }]
        })
      };
    } else {
      const fileImports = flattenRoutes(node.children)
        .filter(({ file, component }) => file !== undefined && component !== undefined)
        .map(({ file, component }) => ({ file: removeFileExtension(file as string), component }));

      const fileContent = indexTemplate({ routes: node.children, fileImports });

      return {
        path: node.route,
        fileName: `${node.route}.index.ts`,
        fileContent
      };
    }
  });

  return routeFiles;
}
