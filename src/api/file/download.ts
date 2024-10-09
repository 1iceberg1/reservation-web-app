import FileStorage from '../../services/file/fileStorage';
import ApiResponseHandler from '../apiResponseHandler';

/**
 * Download a file from localhost.
 */
export default async (req, res, next) => {
  try {
    const filename = req.query.filename;
    const privateUrl = req.query.privateUrl;
    const inline = req.query.inline;

    if (!privateUrl) {
      return ApiResponseHandler.error(req, res, {
        code: '404',
      });
    }

    const path = await FileStorage.download(privateUrl);

    if (inline) {
      await ApiResponseHandler.send(req, res, path);
    } else {
      res.removeHeader('Cross-Origin-Resource-Policy');
      res.removeHeader('Cross-Origin-Embedder-Policy');

      await ApiResponseHandler.download(req, res, path, filename);
    }
  } catch (error) {
    await ApiResponseHandler.error(req, res, error);
  }
};
