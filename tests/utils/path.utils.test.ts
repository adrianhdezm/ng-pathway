import { getBaseUrl, getRelativePath } from '../../src/utils/path.utils';
describe('path.utils', () => {
  describe('getBaseUrl', () => {
    describe('success cases', () => {
      it('should return the base URL of an array of file paths', () => {
        const filePaths = ['src/pages/home/index.ts', 'src/pages/about/index.ts', 'src/pages/blog/post-1.ts'];
        const expectedBaseUrl = 'src/pages';
        const baseUrl = getBaseUrl(filePaths);
        expect(baseUrl).toEqual(expectedBaseUrl);
      });

      it('should return the directory of the only file path in the array', () => {
        const filePaths = ['src/pages/home/index.ts'];
        const expectedBaseUrl = 'src/pages/home';
        const baseUrl = getBaseUrl(filePaths);
        expect(baseUrl).toEqual(expectedBaseUrl);
      });

      it('should handle file paths with different levels of subdirectories', () => {
        const filePaths = [
          'src/pages/home/index.ts',
          'src/pages/about/index.ts',
          'src/pages/blog/post-1.ts',
          'src/shared/components/button/index.ts'
        ];
        const expectedBaseUrl = 'src';
        const baseUrl = getBaseUrl(filePaths);
        expect(baseUrl).toEqual(expectedBaseUrl);
      });

      it('should handle file paths with different separators', () => {
        const filePaths = ['src\\pages\\home\\index.ts', 'src/pages/about/index.ts', 'src/shared\\components/button/index.ts'];
        const expectedBaseUrl = 'src';
        const baseUrl = getBaseUrl(filePaths);
        expect(baseUrl).toEqual(expectedBaseUrl);
      });

      it('should handle file paths with relative paths', () => {
        const filePaths = ['../pages/home/index.ts', '../pages/about/index.ts', '../pages/blog/post-1.ts'];
        const expectedBaseUrl = '../pages';
        const baseUrl = getBaseUrl(filePaths);
        expect(baseUrl).toEqual(expectedBaseUrl);
      });

      it('should handle file paths with absolute paths', () => {
        const filePaths = ['/src/pages/home/index.ts', '/src/pages/about/index.ts', '/src/pages/blog/post-1.ts'];
        const expectedBaseUrl = '/src/pages';
        const baseUrl = getBaseUrl(filePaths);
        expect(baseUrl).toEqual(expectedBaseUrl);
      });
    });

    describe('failure cases', () => {
      it('should return an empty string if the array of file paths is empty', () => {
        const filePaths: string[] = [];
        const expectedBaseUrl = '';
        const baseUrl = getBaseUrl(filePaths);
        expect(baseUrl).toEqual(expectedBaseUrl);
      });
    });
  });

  describe('getRelativePath', () => {
    const importPath = 'src';
    const routePath = 'src/pages/home/index.ts';
    const identicalPath = '/src/app';

    describe('success cases', () => {
      it('returns the correct relative path when given two valid file paths', () => {
        expect(getRelativePath(importPath, routePath)).toBe('pages/home/index.ts');
      });

      it('returns the correct relative path when given two valid file paths in reverse order', () => {
        expect(getRelativePath(routePath, importPath)).toBe('../../..');
      });

      it('returns an empty string when given two identical file paths', () => {
        expect(getRelativePath(identicalPath, identicalPath)).toBe('');
      });
    });

    describe('failure cases', () => {
      it('throws an error when given an empty import path', () => {
        expect(() => getRelativePath('', routePath)).toThrowError(`Invalid import path: ""`);
      });

      it('throws an error when given an empty route path', () => {
        expect(() => getRelativePath(importPath, '')).toThrowError(`Invalid route path: ""`);
      });

      it('throws an error when there is no relative path between the file paths', () => {
        const invalidImportPath = 'app';

        expect(() => getRelativePath(invalidImportPath, routePath)).toThrowError(
          `No relative path between "${invalidImportPath}" and "${routePath}"`
        );
      });
    });
  });
});
