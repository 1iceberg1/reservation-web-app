import { getConfig } from '../../config';
import appRootPath from 'app-root-path';
import Error403 from '../../errors/Error403';
import fs from 'fs';
import os from 'os';
import path from 'path';
import slug from 'slug';

slug.charmap['.'] = '.';
slug.charmap['_'] = '_';

// Default upload directory if not provided in configuration
const UPLOAD_DIR = getRealPath(getConfig().FILE_STORAGE_PATH) || os.tmpdir();

export default class LocalFileStorage {
  static internalUrl(privateUrl) {
    return path.join(UPLOAD_DIR, privateUrl);
  }

  /**
   * Handles the upload to the server.
   */
  static async upload(file, privateUrl, filename, publicRead, maxSizeInBytes) {
    const internalUrl = this.internalUrl(privateUrl);

    if (!isPathInsideUploadDir(internalUrl)) {
      throw new Error403();
    }
    await ensureDirectoryExistence(internalUrl);

    await fs.promises.writeFile(internalUrl, file.buffer);

    return this.downloadUrl(filename, privateUrl);
  }

  /**
   * Return the download URL of the file from this server.
   */
  static async downloadUrl(filename, privateUrl) {
    return `${getConfig().BACKEND_URL}/file/download?privateUrl=${privateUrl}&filename=${slug(
      filename || '',
      {
        lower: false,
      }
    )}`;
  }

  /**
   * Downloads the file.
   */
  static async download(privateUrl) {
    const finalPath = this.internalUrl(privateUrl);
    if (!isPathInsideUploadDir(finalPath)) {
      throw new Error403();
    }
    return finalPath;
  }
}

async function ensureDirectoryExistence(filePath) {
  const dirname = path.dirname(filePath);

  if (fs.existsSync(dirname)) {
    return true;
  }

  // Create directories recursively
  await fs.promises.mkdir(dirname, { recursive: true });
  return true;
}

function isPathInsideUploadDir(filePath) {
  const uploadUrlWithSlash =
    UPLOAD_DIR.endsWith(path.sep) ? UPLOAD_DIR : `${UPLOAD_DIR}${path.sep}`;
  return filePath.startsWith(uploadUrlWithSlash);
}

function getRealPath(url) {
  const patterns = [{ find: /\{APP_ROOT\}/g, replace: appRootPath.path }];

  if (!url) {
    return url;
  }

  let result = url;
  for (const pattern of patterns) {
    result = result.replace(pattern.find, pattern.replace);
  }

  return result.replace(/\//g, path.sep).replace(/\\/g, path.sep);
}
