import glob from 'glob';
import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';
import { Route, RouteFile } from './types';
import { extractFolders, getBaseUrl } from './utils/path.utils';
import { buildFolderTreeFromHierarchy, flattenRoutes, generateFolderHierarchy, mapNodes, mapNodesToRoutes } from './utils/graph.utils';
import { computeAngularRoute, computeComponentName, isString } from './utils/string.utils';

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
  const routeGraphWithAngularRoute = mapNodes(routeGraph, (node) => {
    const { data } = node;
    return {
      ...node,
      data: {
        ...data,
        route: computeAngularRoute(data.path, node.parent)
      }
    };
  });

  //Remove files from Nodes with children in Routes Graph
  const routeGraphWithFilteredFiles = mapNodes(routeGraphWithAngularRoute, (node) => {
    if (node.children.length < 1) {
      return node;
    }
    const { data } = node;
    return { ...node, data: { ...data, files: [] } };
  });

  //Add correct component file property to Nodes in Routes Graph
  const routeGraphWithFile = mapNodes(routeGraphWithFilteredFiles, (node) => {
    const { data } = node;
    return {
      ...node,
      data: {
        ...data,
        file: data.files[0]
      }
    };
  });

  // Handle Layout Nodes from Routes Graph
  const routeGraphWithoutLayoutNodes = mapNodes(routeGraphWithFile, (node) => {
    const { data, children } = node;
    const layoutNodeIndex = children.findIndex((child) => child.data.path.match(/\(([^)]+)\)/));

    if (layoutNodeIndex < 0) {
      return node;
    }

    const file = children[layoutNodeIndex].data.file;
    return {
      ...node,
      data: { ...data, file },
      children: [...children.slice(0, layoutNodeIndex), ...children.slice(layoutNodeIndex + 1)]
    };
  });

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
  const indexTemplate = Handlebars.compile<{
    path: string;
    component: string;
    children: Route[];
    fileImports: { file: string; component: string }[];
  }>(indexTemplateSource);

  const routeFiles = routeGraphForAngularRouter.map((node) => {
    const fileName = node.route === '' ? 'index.ts' : `${node.route}.index.ts`;

    const fileImports = [
      ...(node.file && node.component ? [{ file: node.file, component: node.component }] : []),
      ...flattenRoutes(node.children)
        .filter(({ file, component }) => file !== undefined && component !== undefined)
        .map(({ file, component }) => ({ file, component }))
    ] as { file: string; component: string }[];

    const fileContent = indexTemplate({ path: node.route, component: node.component, children: node.children, fileImports });
    return {
      path: node.route,
      fileName,
      fileContent
    };
  });

  return routeFiles;
}
