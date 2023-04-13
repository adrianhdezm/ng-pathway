import { computeAngularRoute, computeComponentName, isString } from '../../src/utils/string.utils';

describe('string.utils', () => {
  describe('computeAngularRoute', () => {
    it('should return path as is when parent is null', () => {
      const input = { path: 'Teams', parent: null };
      const output = computeAngularRoute(input.path, input.parent);
      expect(output).toBe('Teams');
    });

    it('should remove parent from path when parent is not null', () => {
      const input = { path: 'Teams/[id]', parent: 'Teams' };
      const output = computeAngularRoute(input.path, input.parent);
      expect(output).toBe(':id');
    });

    it('should handle parameters when parent is null', () => {
      const input = { path: 'Products/[id]/[...custom]', parent: null };
      const output = computeAngularRoute(input.path, input.parent);
      expect(output).toBe('Products/:id/**');
    });

    it('should return empty path when parent is path', () => {
      const input = { path: 'Teams', parent: null };
      const output = computeAngularRoute(input.path, input.parent);
      expect(output).toBe('Teams');
    });

    it('should throw an error when parent is not part of path', () => {
      const input = { path: 'Products/[id]', parent: 'Teams' };
      expect(() => computeAngularRoute(input.path, input.parent)).toThrowError(
        "Item with path 'Products/[id]' does not have the correct parent 'Teams'"
      );
    });

    it('should replace simple parameter with colon', () => {
      const input = { path: 'Teams/[teamId]', parent: 'Teams' };
      const output = computeAngularRoute(input.path, input.parent);
      expect(output).toBe(':teamId');
    });

    it('should replace wildcard parameter with asterisk', () => {
      const input = { path: 'Teams/[id]/[...custom]', parent: 'Teams/[id]' };
      const output = computeAngularRoute(input.path, input.parent);
      expect(output).toBe('**');
    });

    it('should replace complex parameter with colon', () => {
      const input = { path: 'Teams/[teamId]/(team-details)', parent: 'Teams' };
      const output = computeAngularRoute(input.path, input.parent);
      expect(output).toBe(':teamId/(team-details)');
    });

    it('should replace only relative paths', () => {
      const input = { path: 'Teams/[teamId]/[team-details]', parent: 'Teams/[teamId]' };
      const output = computeAngularRoute(input.path, input.parent);
      expect(output).toBe(':team-details');
    });
  });

  describe('computeComponentName', () => {
    it('should return PascalCase component name from Angular file path', () => {
      const filePath = './pages/Teams/[id]/(team-details)/team-details-layout.component';
      const componentName = computeComponentName(filePath);
      expect(componentName).toEqual('TeamDetailsLayoutComponent');
    });

    it('should return PascalCase component name from simple Angular file path', () => {
      const filePath = './pages/dashboard-page.component';
      const componentName = computeComponentName(filePath);
      expect(componentName).toEqual('DashboardPageComponent');
    });

    it('should return PascalCase component name from a file path with [...custom]', () => {
      const filePath = './pages/Teams/[id]/[...custom]/team-custom-page.component';
      const componentName = computeComponentName(filePath);
      expect(componentName).toEqual('TeamCustomPageComponent');
    });

    it('should return PascalCase component name from a file path with (team-details)', () => {
      const filePath = './pages/Teams/[id]/(team-details)/team-details-layout.component';
      const componentName = computeComponentName(filePath);
      expect(componentName).toEqual('TeamDetailsLayoutComponent');
    });

    it('should return PascalCase component ignoring the file extension', () => {
      const filePath = './pages/dashboard-page.component.ts';
      const componentName = computeComponentName(filePath);
      expect(componentName).toEqual('DashboardPageComponent');
    });

    it('should return PascalCase component name from component not following the Angular file name convention', () => {
      const filePath = './pages/dashboard-page';
      const componentName = computeComponentName(filePath);
      expect(componentName).toEqual('DashboardPage');
    });
    it('should return PascalCase service name from simple Angular file path', () => {
      const filePath = './pages/dashboard.service';
      const componentName = computeComponentName(filePath);
      expect(componentName).toEqual('DashboardService');
    });
  });

  describe('isString', () => {
    it('should return true for a string value', () => {
      const input = 'hello';
      const expected = true;
      const result = isString(input);
      expect(result).toEqual(expected);
    });
    it('should return false for a non-string value', () => {
      const input = 123;
      const expected = false;
      const result = isString(input);
      expect(result).toEqual(expected);
    });

    it('should return false for null value', () => {
      const input = null;
      const expected = false;
      const result = isString(input);
      expect(result).toEqual(expected);
    });

    it('should return false for undefined value', () => {
      const input = undefined;
      const expected = false;
      const result = isString(input);
      expect(result).toEqual(expected);
    });
  });
});
