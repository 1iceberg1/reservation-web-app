import PermissionChecker from '../../services/user/permissionChecker';
import Storage from '../../security/storage';
import FileStorage from '../../services/file/fileStorage';
import ApiResponseHandler from '../apiResponseHandler';
import Error403 from '../../errors/Error403';
import moment from 'moment';
import { v4 as uuid } from 'uuid';
import FileService from '../../services/fileService';

export default async (req, res) => {
  try {
    const permissionChecker = new PermissionChecker(req);

    const { storageId } = req.body;
    const { file } = req;
    const originalFilename = file.originalname;
    const extension = extractExtensionFrom(originalFilename);
    const fileId = uuid();
    const filename = `${fileId}.${extension}`;

    const fileService = new FileService(req);

    if (!req.currentUser || !req.currentUser.id) {
      throw new Error403();
    }

    // The config storage has the information on where
    // to store the file and the max size
    const config = Storage.values[storageId];

    if (!config) {
      throw new Error403();
    }

    if (
      // Some permissions are related to the user itself,
      // not related to any entity, that's why there is a bypass permissions
      !config.bypassWritingPermissions &&
      !permissionChecker.hasStorage(storageId)
    ) {
      throw new Error403();
    }

    // The private URL is the path related to the bucket/file system folder
    let privateUrl = `${config.folder}/${filename}`;
    privateUrl = privateUrl.replace(':userId', req.currentUser.id);

    const maxSizeInBytes = config.maxSizeInBytes;
    const publicRead = Boolean(config.publicRead);

    const downloadUrl = await FileStorage.upload(
      file,
      privateUrl,
      filename,
      publicRead,
      maxSizeInBytes
    );

    const data = {
      title: extractNameFrom(originalFilename),
      name: originalFilename,
      sizeInBytes: file.size,
      privateUrl,
      downloadUrl,
      new: true,
      uploader: req.currentUser,
      uploadedAt: moment.now(),
    };

    const record = await fileService.create(data);

    return ApiResponseHandler.success(req, res, {
      ...data,
      id: record.id,
    });
  } catch (error) {
    await ApiResponseHandler.error(req, res, error);
  }
};

const extractNameFrom = filename => {
  if (!filename) {
    return null;
  }

  return filename.substring(0, filename.lastIndexOf('.'));
};

const extractExtensionFrom = filename => {
  if (!filename) {
    return null;
  }

  const regex = /(?:\.([^.]+))?$/;
  const exec = regex.exec(filename);

  if (!exec) {
    return null;
  }

  return exec[1].toLowerCase();
};
