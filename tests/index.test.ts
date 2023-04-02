import glob from 'glob';
import { getRouteData } from '../src/index';

describe('index.ts', () => {
  describe('getRouteData', () => {
    it('returns the expected routes are located in the same places within the directory hierarchy', () => {
      const files = [
        'src/pages/foo/bar.component.ts',
        'src/pages/baz/index.component.ts',
        'src/pages/qux/quux.component.ts',
        'src/pages/corge/[id].component.ts',
        'src/pages/grault/[...params].component.ts'
      ];
      jest.spyOn(glob, 'sync').mockReturnValueOnce(files);

      const routes = getRouteData('src', 'src/pages/**/[a-z]*.ts');

      expect(routes).toEqual([
        { path: 'foo/bar', file: './pages/foo/bar.component' },
        { path: 'baz', file: './pages/baz/index.component' },
        { path: 'qux/quux', file: './pages/qux/quux.component' },
        { path: 'corge/:id', file: './pages/corge/[id].component' },
        { path: 'grault/*', file: './pages/grault/[...params].component' }
      ]);
    });

    it('returns the expected routes when paths are located in different places within the directory hierarchy', () => {
      const files = [
        'src/pages/foo/bar.component.ts',
        'src/pages/baz/index.component.ts',
        'src/pages/qux/quux.component.ts',
        'src/pages/corge/[id].component.ts',
        'src/pages/grault/[...params].component.ts'
      ];
      jest.spyOn(glob, 'sync').mockReturnValueOnce(files);

      const routes = getRouteData('src/app', 'src/pages/**/[a-z]*.ts');

      expect(routes).toEqual([
        { path: 'foo/bar', file: '../pages/foo/bar.component' },
        { path: 'baz', file: '../pages/baz/index.component' },
        { path: 'qux/quux', file: '../pages/qux/quux.component' },
        { path: 'corge/:id', file: '../pages/corge/[id].component' },
        { path: 'grault/*', file: '../pages/grault/[...params].component' }
      ]);
    });

    it('handles the root index.component.ts files correctly', () => {
      const importBasePath = 'src';
      const pagesPattern = 'src/pages/**/[a-z]*.ts';
      const files = ['src/pages/index.component.ts'];
      jest.spyOn(glob, 'sync').mockReturnValueOnce(files);

      const routeData = getRouteData(importBasePath, pagesPattern);
      expect(routeData).toEqual([{ path: '', file: './pages/index.component' }]);
    });

    it('handles [...foo] patterns in file names correctly', () => {
      const importBasePath = 'src';
      const pagesPattern = 'src/pages/**/[a-z]*.ts';
      const files = ['src/pages/[...foo].ts'];
      jest.spyOn(glob, 'sync').mockReturnValueOnce(files);

      const routeData = getRouteData(importBasePath, pagesPattern);
      expect(routeData).toEqual([{ path: '*', file: './pages/[...foo]' }]);
    });

    it('handles [...foo] patterns in file names correctly for nested routes', () => {
      const importBasePath = 'src';
      const pagesPattern = 'src/pages/**/[a-z]*.ts';
      const files = ['src/pages/home/[...foo].ts'];
      jest.spyOn(glob, 'sync').mockReturnValueOnce(files);

      const routeData = getRouteData(importBasePath, pagesPattern);
      expect(routeData).toEqual([{ path: 'home/*', file: './pages/home/[...foo]' }]);
    });

    it('handles [foo] patterns in file names correctly', () => {
      const importBasePath = 'src';
      const pagesPattern = 'src/pages/**/[a-z]*.ts';
      const files = ['src/pages/[foo].ts'];
      jest.spyOn(glob, 'sync').mockReturnValueOnce(files);

      const routeData = getRouteData(importBasePath, pagesPattern);
      expect(routeData).toEqual([{ path: ':foo', file: './pages/[foo]' }]);
    });

    it('handles [foo] patterns in file names correctly for nested routes', () => {
      const importBasePath = 'src';
      const pagesPattern = 'src/pages/**/[a-z]*.ts';
      const files = ['src/pages/home/[foo].ts'];
      jest.spyOn(glob, 'sync').mockReturnValueOnce(files);

      const routeData = getRouteData(importBasePath, pagesPattern);
      expect(routeData).toEqual([{ path: 'home/:foo', file: './pages/home/[foo]' }]);
    });

    it('handles trailing slashes correctly', () => {
      const trailingImportBasePath = 'src';
      const trailingPagesPattern = 'src/pages/**/[a-z]*.ts';
      const files = [
        'src/pages/details/home.component.ts',
        'src/pages/details/about.component.ts',
        'src/pages/details/contact.component.ts'
      ];
      jest.spyOn(glob, 'sync').mockReturnValueOnce(files);

      const trailingRouteData = getRouteData(trailingImportBasePath, trailingPagesPattern);
      expect(trailingRouteData).toEqual([
        { path: 'details/home', file: './pages/details/home.component' },
        { path: 'details/about', file: './pages/details/about.component' },
        { path: 'details/contact', file: './pages/details/contact.component' }
      ]);
    });
  });
});
