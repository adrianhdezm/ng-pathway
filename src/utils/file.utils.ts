import * as fs from 'fs';
import * as path from 'path';

export function emptyDirSync(folderPath: string) {
  if (fs.existsSync(folderPath)) {
    fs.readdirSync(folderPath).forEach((file) => {
      const filePath = path.join(folderPath, file);
      if (fs.lstatSync(filePath).isDirectory()) {
        emptyDirSync(filePath);
      } else {
        fs.unlinkSync(filePath);
      }
    });
    fs.rmSync(folderPath, { recursive: true, force: true });
  }
}
