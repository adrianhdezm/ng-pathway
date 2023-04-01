import glob from 'glob';
import { getRouteData } from '../src/index';

describe('index.ts', () => {
  describe('getRouteData', () => {
    it('returns the expected routes', () => {
      const files = [
        'src/app/pages/foo/bar.component.ts',
        'src/app/pages/baz/index.component.ts',
        'src/app/pages/qux/quux.component.ts',
        'src/app/pages/corge/[id].component.ts',
        'src/app/pages/grault/[...params].component.ts'
      ];
      jest.spyOn(glob, 'sync').mockReturnValueOnce(files);

      const routes = getRouteData('src/app/pages/**/[a-z]*.ts');

      expect(routes).toEqual([
        { path: 'foo/bar', file: './pages/foo/bar.component' },
        { path: 'baz', file: './pages/baz/index.component' },
        { path: 'qux/quux', file: './pages/qux/quux.component' },
        { path: 'corge/:id', file: './pages/corge/[id].component' },
        { path: 'grault/*', file: './pages/grault/[...params].component' }
      ]);
    });
  });
});
