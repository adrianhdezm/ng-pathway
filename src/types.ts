export interface FolderMetadata {
  path: string;
  parent: string | null;
  files: string[];
}

export interface FolderNode {
  parent: string | null;
  children: FolderNode[];
  data: {
    path: string;
    files: string[];
    [key: string]: string | string[] | undefined;
  };
}

export interface Route {
  component: string;
  file?: string;
  route: string;
  children: Route[];
}

export interface RouteFile {
  fileName: string;
  fileContent: string;
}
