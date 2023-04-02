import glob from 'glob';
import { getBaseUrl, getRelativePath } from './utils/path.utils';

interface RouteData {
  path: string;
  file: string;
}

export function getRouteData(importBasePath: string, pagesPattern: string): RouteData[] {
  const filePaths = glob.sync(pagesPattern);
  const baseUrl = getBaseUrl(filePaths);
  const relativePath = getRelativePath(importBasePath, baseUrl);
  const nestedRoute = baseUrl.replace(/.*\/pages(\/)?/, '');

  return filePaths.map((filePath) => {
    const pathSegment = filePath
      .replace(new RegExp(`^${baseUrl}/index.component.ts$`), '') // handle special case of index.component.ts
      .replace(new RegExp(`^${baseUrl}/`), '') // remove baseUrl and first slash
      .replace(/(?:\/index)?(?:\.component)?\.ts$/, '') // remove suffixes
      .replace(/\[\.{3}.+\]/, '*') // replace [...foo] with *
      .replace(/\[(.+)\]/, ':$1') // replace [foo] with :foo
      .replace(/^(.+?)\/$/, '$1'); // remove trailing slash

    const path = nestedRoute !== '' ? `${nestedRoute}/${pathSegment}` : pathSegment;

    const relativePathPrefix = relativePath.startsWith('..') ? '' : './';
    const file = filePath.replace(/\.ts$/, '').replace(new RegExp(`^${baseUrl}`), `${relativePathPrefix}${relativePath}`);

    return { path, file };
  });
}
