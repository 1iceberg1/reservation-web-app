import { IRepositoryOptions } from './IRepositoryOptions';
import Error404 from '../../errors/Error404';
import File from '../models/file';
import FileStorage from '../../services/file/fileStorage';
import MongooseRepository from './mongooseRepository';
import lodash from 'lodash';

export default class FileRepository {
  static async create(data, options: IRepositoryOptions) {
    const [record] = await File(options.database).create([data], options);

    return this.findById(record.id, options);
  }

  static async update(id, data, options: IRepositoryOptions) {
    await File(options.database).updateOne({ _id: id }, data, options);

    return this.findById(id, options);
  }

  static async findById(id, options: IRepositoryOptions) {
    let record = await MongooseRepository.wrapWithSessionIfExists(
      File(options.database).findOne({
        _id: id,
      }),
      options
    );

    if (!record) {
      throw new Error404();
    }

    return this._mapRelationshipsAndFillDownloadUrl(record);
  }

  static async cleanupForRelationships(attachments) {
    if (!attachments) {
      return attachments;
    }
    const records = Array.isArray(attachments) ? attachments : [attachments];
    return await Promise.all(
      records.map(
        async record => await this._mapRelationshipsAndFillDownloadUrl(record)
      )
    );
  }

  static async filterId(file, options: IRepositoryOptions) {
    return lodash.get(await this.filterIds([file], options), '[0]', null);
  }

  static async filterIds(files, options: IRepositoryOptions) {
    if (!files || !files.length) {
      return [];
    }

    const records = await File(options.database)
      .find({
        _id: { $in: files.map(file => file.id || file) },
      })
      .select(['_id']);

    return records.map(record => record._id);
  }

  static async _mapRelationshipsAndFillDownloadUrl(record) {
    if (!record) {
      return null;
    }

    const output = record.toObject ? record.toObject() : record;

    let downloadUrl;

    if (record.publicUrl) {
      downloadUrl = record.publicUrl;
    } else {
      downloadUrl = await FileStorage.downloadUrl(
        record.name,
        record.privateUrl
      );
    }

    output.downloadUrl = downloadUrl;

    return output;
  }
}
