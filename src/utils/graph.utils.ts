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
      data: { path, files },
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
    const { data } = node;
    const children = mapNodesToRoutes(node.children);
    return {
      component: data.component as string,
      file: data.file as string | undefined,
      route: data.route as string,
      children
    };
  });
}

export function flattenRoutes(
  nodes: Route[],
  flattenedRoutes: Pick<Route, 'component' | 'file' | 'route'>[] = []
): Pick<Route, 'component' | 'file' | 'route'>[] {
  for (const node of nodes) {
    const { children, ...rest } = node;
    flattenedRoutes.push(rest);
    if (children.length > 0) {
      flattenRoutes(children, flattenedRoutes);
    }
  }
  return flattenedRoutes;
}

export function addAngularRouteToGraphNodes(routeGraph: FolderNode[]) {
  return mapNodes(routeGraph, (node) => {
    const { data } = node;
    return {
      ...node,
      data: {
        ...data,
        route: computeAngularRoute(data.path, node.parent)
      }
    };
  });
}

export function filterFilesFromNodeWithChildren(routeGraph: FolderNode[]) {
  return mapNodes(routeGraph, (node) => {
    if (node.children.length < 1) {
      return node;
    }
    const { data } = node;
    return { ...node, data: { ...data, files: [] } };
  });
}

export function addComponentFileToGraphNodes(routeGraph: FolderNode[]) {
  return mapNodes(routeGraph, (node) => {
    const { data } = node;
    const file = data.files.find((file) => file.endsWith('.component.ts'));
    return {
      ...node,
      data: {
        ...data,
        file
      }
    };
  });
}

export function addProvidersFileToGraphNodes(routeGraph: FolderNode[]) {
  return mapNodes(routeGraph, (node) => {
    const { data } = node;
    const providersFile = data.files.find((file) => file.endsWith('.providers.ts'));
    return {
      ...node,
      data: {
        ...data,
        providersFile
      }
    };
  });
}

export function handleLayoutNodesInGraph(routeGraph: FolderNode[]) {
  return mapNodes(routeGraph, (node) => {
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
}

export function computeComponentNameFromFilePath(routeGraph: FolderNode[]) {
  return mapNodes(routeGraph, (node) => {
    const { data } = node;
    return {
      ...node,
      data: {
        ...data,
        component: isString(data.file) ? computeElementName(data.file as string) : undefined
      }
    };
  });
}
