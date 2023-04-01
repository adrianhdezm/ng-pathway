import glob from 'glob';

interface RouteData {
  path: string;
  file: string;
}

export function getRouteData(pattern: string): RouteData[] {
  const files = glob.sync(pattern);

  return files.map((file) => {
    const path = file
      .replace(/^src\/app\/pages\/index\.component\.ts$/, '') // handle special case of index.component.ts
      .replace(/^src\/app\/pages\//, '') // remove src/pages and first slash
      .replace(/(?:\/index)?(?:\.component)?\.ts$/, '') // remove suffixes
      .replace(/\[\.{3}.+\]/, '*') // replace [...foo] with *
      .replace(/\[(.+)\]/, ':$1') // replace [foo] with :foo
      .replace(/^(.+?)\/$/, '$1'); // remove trailing slash

    return {
      path,
      file: file.replace(/\.ts$/, '').replace(/^src\/app/, '.')
    };
  });
}
