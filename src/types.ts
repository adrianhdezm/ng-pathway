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
  component?: string;
  file?: string;
  providersFile?: string;
  providers?: string;
  matchersFile?: string;
  matchers?: string;
  route: string;
  children: Route[];
}

export interface RouteFile {
  path: string;
  fileName: string;
  fileContent: string;
}
