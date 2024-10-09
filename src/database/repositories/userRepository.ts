import { IRepositoryOptions } from './IRepositoryOptions';
import Error404 from '../../errors/Error404';
import FileRepository from './fileRepository';
import MongooseQueryUtils from '../utils/mongooseQueryUtils';
import MongooseRepository from './mongooseRepository';
import User from '../models/user';

export default class UserRepository {
  static async create(data, options: IRepositoryOptions) {
    const [user] = await User(options.database).create([data], options);

    delete user.password;

    return this.findById(user.id, {
      ...options,
      bypassPermissionValidation: true,
    });
  }

  static async update(id, data, options: IRepositoryOptions) {
    await User(options.database).updateOne({ _id: id }, data, options);

    const user = await this.findById(id, options);

    return user;
  }

  static async findByEmail(email, options: IRepositoryOptions) {
    const record = await MongooseRepository.wrapWithSessionIfExists(
      User(options.database)
        .findOne({
          email: {
            $regex: new RegExp(`^${MongooseQueryUtils.escapeRegExp(email)}$`),
            $options: 'i',
          },
        })
        .populate('avatar'),
      options
    );
    return await this._fillRelationsAndFileDownloadUrls(record);
  }

  static async findAndCountAll(
    { filter, limit = 0, offset = 0, orderBy = '' },
    options: IRepositoryOptions
  ) {
    let criteriaAnd: any = [];

    if (filter) {
      if (filter.id) {
        criteriaAnd.push({
          ['_id']: MongooseQueryUtils.uuid(filter.id),
        });
      }

      if (filter.name) {
        criteriaAnd.push({
          ['name']: {
            $regex: MongooseQueryUtils.escapeRegExp(filter.name),
            $options: 'i',
          },
        });
      }

      if (filter.email) {
        criteriaAnd.push({
          ['email']: {
            $regex: MongooseQueryUtils.escapeRegExp(filter.email),
            $options: 'i',
          },
        });
      }

      if (filter.role) {
        criteriaAnd.push({
          role: { $eq: filter.role },
        });
      }

      if (filter.status) {
        criteriaAnd.push({
          status: { $eq: filter.status },
        });
      }

      if (filter.phoneNumber) {
        criteriaAnd.push({
          ['phoneNumber']: {
            $eq: filter.phoneNumber,
          },
        });
      }
    }

    const sort = MongooseQueryUtils.sort(orderBy || 'createdAt_DESC');

    const skip = Number(offset || 0) || undefined;
    const limitEscaped = Number(limit || 0) || undefined;
    const criteria = criteriaAnd.length ? { $and: criteriaAnd } : null;

    let rows = await MongooseRepository.wrapWithSessionIfExists(
      User(options.database)
        .find(criteria)
        .skip(skip)
        .limit(limitEscaped)
        .sort(sort)
        .populate('avatar'),
      options
    );

    const count = await MongooseRepository.wrapWithSessionIfExists(
      User(options.database).countDocuments(criteria),
      options
    );

    rows = await Promise.all(
      rows.map(row => this._fillRelationsAndFileDownloadUrls(row))
    );

    return { rows, count };
  }

  static async findAllAutocomplete(search, limit, options: IRepositoryOptions) {
    let criteriaAnd: any = [];

    if (search) {
      criteriaAnd.push({
        $or: [
          {
            _id: MongooseQueryUtils.uuid(search),
          },
          {
            name: {
              $regex: MongooseQueryUtils.escapeRegExp(search),
              $options: 'i',
            },
          },
          {
            email: {
              $regex: MongooseQueryUtils.escapeRegExp(search),
              $options: 'i',
            },
          },
        ],
      });
    }

    const sort = MongooseQueryUtils.sort('fullName_ASC');
    const limitEscaped = Number(limit || 0) || undefined;

    const criteria = { $and: criteriaAnd };

    let rows = await MongooseRepository.wrapWithSessionIfExists(
      User(options.database)
        .find(criteria)
        .limit(limitEscaped)
        .sort(sort)
        .populate('avatar'),
      options
    );

    rows = await Promise.all(
      rows.map(row => this._fillRelationsAndFileDownloadUrls(row))
    );

    return rows.map(user => ({
      id: user.id,
      label: user.name,
      avatar:
        user.avatar && user.avatar.downloadUrl ? user.avatar.downloadUrl : null,
    }));
  }

  static async findById(id, options: IRepositoryOptions) {
    let record = await MongooseRepository.wrapWithSessionIfExists(
      User(options.database).findById(id).populate('avatar'),
      options
    );

    if (!record) {
      throw new Error404();
    }

    record = await this._fillRelationsAndFileDownloadUrls(record);

    return record;
  }

  static async findPassword(id, options: IRepositoryOptions) {
    let record = await MongooseRepository.wrapWithSessionIfExists(
      User(options.database).findById(id).select('+password'),
      options
    );

    if (!record) {
      return null;
    }

    return record.password;
  }

  static async count(filter, options: IRepositoryOptions) {
    return MongooseRepository.wrapWithSessionIfExists(
      User(options.database).countDocuments(filter),
      options
    );
  }

  static async _fillRelationsAndFileDownloadUrls(record) {
    if (!record) {
      return null;
    }

    const output = record.toObject ? record.toObject() : record;

    const avatars = await FileRepository.cleanupForRelationships(output.avatar);

    output.avatar = avatars ? avatars[0] : null;

    return output;
  }

  static async destroy(id, options: IRepositoryOptions) {
    const user = await MongooseRepository.wrapWithSessionIfExists(
      User(options.database).findOne({
        _id: id,
      }),
      options
    );

    if (!user) {
      throw new Error404();
    }

    await User(options.database).deleteOne({ _id: id }, options);
  }
}
