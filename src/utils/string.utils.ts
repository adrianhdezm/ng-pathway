export function computeAngularRoute(path: string, parent: string | null): string {
  if (path === '' || path === parent) {
    return '';
  }

  if (parent !== null && !path.startsWith(parent)) {
    throw new Error(`Item with path '${path}' does not have the correct parent '${parent}'`);
  }

  return path
    .replace(`${parent}/`, '') // remove item.parent
    .replace(/\[\.{3}.+\]/, '**') // replace [...foo] with **
    .replace(/\[(.+)\]/, ':$1'); // replace [foo] with :foo
}

export function computeElementName(filePath: string): string {
  const pathSegments = filePath.split('/');
  const fileName = pathSegments[pathSegments.length - 1];

  // Compute the element name from the file name wihtout the suffix
  const elementNameSegment = fileName.split('.')[0];
  const elementNameSegments = elementNameSegment.split(/[-()]/);
  const elementName = elementNameSegments.map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1)).join('');

  // Compute the element name from the file name wihtout the suffix
  const suffixSegment = fileName.split('.')[1];
  const suffix = suffixSegment ? suffixSegment.charAt(0).toUpperCase() + suffixSegment.slice(1) : '';

  return `${elementName}${suffix}`;
}

export function isString(value: unknown) {
  return Object.prototype.toString.call(value) === '[object String]';
}
