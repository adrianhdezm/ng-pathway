import { Route, FolderNode, FolderMetadata } from '../types';
import { computeAngularRoute, computeElementName, isString } from './string.utils';

export function generateFolderHierarchy(folderPaths: string[], baseUrl: string, filePaths: string[]): FolderMetadata[] {
  return folderPaths.map((folderPath) => {
    const relativeFolderPath = folderPath.replace(new RegExp(`^${baseUrl}/?`), '');
    const parentPath = relativeFolderPath.substring(0, relativeFolderPath.lastIndexOf('/'));

    const files = filePaths.filter((filePath) => {
      const fileFolderPath = filePath.substring(0, filePath.lastIndexOf('/'));
      return fileFolderPath === folderPath;
    });

    return {
      path: relativeFolderPath,
      files,
      parent: parentPath === '' ? null : parentPath
    };
  });
}

export function buildFolderTreeFromHierarchy(folderNodes: FolderMetadata[], parentPath: string | null = null): FolderNode[] {
  const filteredFolderNodes = folderNodes.filter((folderNode) => folderNode.parent === parentPath);
  return filteredFolderNodes.map((folderNode) => {
    const { parent, path, files } = folderNode;
    const children = buildFolderTreeFromHierarchy(folderNodes, folderNode.path);
    return {
      parent,
      data: { path, files: children.length ? [] : files },
      children: children.length ? [{ data: { path, files }, parent: folderNode.path, children: [] }, ...children] : []
    };
  });
}

export function mapNodes(nodes: FolderNode[], callback: (node: FolderNode) => FolderNode): FolderNode[] {
  return nodes.map((node) => {
    const updatedNode = callback(node);
    // allows to mutate the children with the callback by using the updatedNode children
    const updatedChildren = mapNodes(updatedNode.children, callback);
    return {
      ...updatedNode,
      children: updatedChildren
    };
  });
}

export function mapNodesToRoutes(nodes: FolderNode[]): Route[] {
  return nodes.map((node) => {
    const { data, parent } = node;
    const children = mapNodesToRoutes(node.children);

    const route = computeAngularRoute(data.path, parent);
    const file = data.files.find((file) => file.endsWith('.component.ts'));
    const component = isString(file) ? computeElementName(file as string) : undefined;
    const providersFile = data.files.find((file) => file.endsWith('.providers.ts'));
    const providers = isString(providersFile) ? computeElementName(providersFile as string) : undefined;
    const matchersFile = data.files.find((file) => file.endsWith('.matchers.ts'));
    const matchers = isString(matchersFile) ? computeElementName(matchersFile as string) : undefined;

    return {
      component,
      file,
      providers,
      providersFile,
      matchersFile,
      matchers,
      route,
      children
    };
  });
}

export function flattenRoutes(nodes: Route[], flattenedRoutes: Omit<Route, 'children'>[] = []): Omit<Route, 'children'>[] {
  for (const node of nodes) {
    const { children, ...rest } = node;
    flattenedRoutes.push(rest);
    if (children.length > 0) {
      flattenRoutes(children, flattenedRoutes);
    }
  }
  return flattenedRoutes;
}

export function handleLayoutNodesInGraph(routeGraph: FolderNode[]) {
  return mapNodes(routeGraph, (node) => {
    const { data, children } = node;
    const layoutNodeIndex = children.findIndex((child) => child.data.path.match(/\(([^)]+)\)/));

    if (layoutNodeIndex < 0) {
      return node;
    }

    const layoutNode = children[layoutNodeIndex];

    return {
      ...node,
      data: { ...data, files: [...layoutNode.data.files] },
      children: [...children.slice(0, layoutNodeIndex), ...children.slice(layoutNodeIndex + 1)]
    };
  });
}
