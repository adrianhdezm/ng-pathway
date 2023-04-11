import glob from 'glob';
import { routesBuilder } from '../src/index';

describe('index.ts', () => {
  describe('routesBuilder', () => {
    it('renders routes for nested structures', () => {
      const pagesPattern = 'src/pages/**/[a-z]*.ts';
      const files = [
        'src/pages/dashboard-page.component.ts',
        'src/pages/Teams/team-catalog-page.component.ts',
        'src/pages/Teams/[id]/team-overview-page.component.ts',
        'src/pages/Teams/[id]/(team-details)/team-details-layout.component.ts',
        'src/pages/Teams/[id]/history/team-history-page.component.ts',
        'src/pages/Teams/[id]/[...custom]/team-custom-page.component.ts',
        'src/pages/Products/product-catalog-page.component.ts',
        'src/pages/Products/[id]/product-details-page.component.ts'
      ];
      jest.spyOn(glob, 'sync').mockReturnValueOnce(files);

      const routes = routesBuilder(pagesPattern);
      expect(routes).toMatchSnapshot();
    });
  });
});
