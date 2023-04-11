import { Route, FolderNode, FolderMetadata } from '../types';

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
