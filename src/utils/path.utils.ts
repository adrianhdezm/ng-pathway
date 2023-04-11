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

export function extractFolders(filePaths: string[]): string[] {
  const folderSet: Set<string> = new Set();

  filePaths.forEach((filePath) => {
    const folderPath = filePath.substring(0, filePath.lastIndexOf('/'));
    folderSet.add(folderPath);
  });

  return Array.from(folderSet);
}

export function removeFileExtension(filePath: string): string {
  const parsedPath = path.parse(filePath);
  const ext = parsedPath.ext;
  if (ext === '') {
    // If there is no extension, return the path
    return filePath;
  } else {
    // Check if the extension is a known JavaScript or TypeScript extension
    const knownExtensions = ['.js', '.jsx', '.ts', '.tsx'];
    if (knownExtensions.includes(ext)) {
      // If it's a known extension, return the path without the extension
      return path.join(parsedPath.dir, parsedPath.name);
    } else {
      // Otherwise, return the original path
      return filePath;
    }
  }
}
