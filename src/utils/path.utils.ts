import path from 'path';

export function getBaseUrl(filePaths: string[]): string {
  if (filePaths.length === 0) {
    return '';
  }
  const directories = filePaths.map((filePath) => path.dirname(filePath.replace(/\\/g, '/')));
  const firstDirectory = directories[0];
  const parts = firstDirectory.split('/');
  let baseUrl = parts[0];
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    if (directories.every((directory) => directory.startsWith(baseUrl + '/' + part))) {
      baseUrl += '/' + part;
    } else {
      break;
    }
  }
  return baseUrl.replace(/\//g, path.sep);
}

export function getRelativePath(importPath: string, routePath: string): string {
  if (!importPath) {
    throw new Error(`Invalid import path: "${importPath}"`);
  }

  if (!routePath) {
    throw new Error(`Invalid route path: "${routePath}"`);
  }

  const relativePath = path.relative(importPath, routePath);

  if (relativePath === `../${routePath}`) {
    throw new Error(`No relative path between "${importPath}" and "${routePath}"`);
  }

  return relativePath;
}
