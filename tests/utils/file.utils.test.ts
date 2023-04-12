import { emptyDirSync } from '../../src/utils/file.utils';
import * as fs from 'fs';
import * as path from 'path';

describe('file.utils', () => {
  describe('emptyDirSync', () => {
    const tempFolderPath = path.join(__dirname, '..', '..', '.temp');

    beforeEach(() => {
      fs.mkdirSync(tempFolderPath);
      fs.writeFileSync(`${tempFolderPath}/file1.txt`, 'hello world');
      fs.writeFileSync(`${tempFolderPath}/file2.txt`, 'goodbye world');
      fs.mkdirSync(`${tempFolderPath}/subfolder`);
      fs.writeFileSync(`${tempFolderPath}/subfolder/file3.txt`, 'hello from subfolder');
    });

    afterEach(() => {
      fs.rmSync(tempFolderPath, { recursive: true, force: true });
    });

    it('should delete all files in the folder', () => {
      emptyDirSync(tempFolderPath);

      expect(fs.existsSync(`${tempFolderPath}`)).toBe(false);
      expect(fs.existsSync(`${tempFolderPath}/subfolder`)).toBe(false);
    });

    it('should not throw an error if the folder does not exist', () => {
      expect(() => emptyDirSync('./nonexistentFolder')).not.toThrow();
    });

    it('should delete hidden files and folders', () => {
      fs.writeFileSync(`${tempFolderPath}/.hiddenFile`, 'hidden');
      fs.mkdirSync(`${tempFolderPath}/.hiddenFolder`);

      emptyDirSync(tempFolderPath);

      expect(fs.existsSync(`${tempFolderPath}/.hiddenFile`)).toBe(false);
      expect(fs.existsSync(`${tempFolderPath}/.hiddenFolder`)).toBe(false);
    });
  });
});
