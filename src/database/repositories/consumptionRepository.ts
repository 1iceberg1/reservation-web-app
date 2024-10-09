import { IRepositoryOptions } from './IRepositoryOptions';
import Error404 from '../../errors/Error404';
import MongooseQueryUtils from '../utils/mongooseQueryUtils';
import MongooseRepository from './mongooseRepository';
import Consumption from '../models/consumption';

class ConsumptionRepository {
  static async create(data, options: IRepositoryOptions) {
    const currentUser = MongooseRepository.getCurrentUser(options);

    const [record] = await Consumption(options.database).create(
      [
        {
          ...data,
          createdBy: currentUser.id,
        },
      ],
      options
    );

    return this.findById(record.id, options);
  }

  static async update(id, data, options: IRepositoryOptions) {
    let record = await MongooseRepository.wrapWithSessionIfExists(
      Consumption(options.database).findOne({
        _id: id,
      }),
      options
    );

    if (!record) {
      throw new Error404();
    }

    await Consumption(options.database).updateOne(
      { _id: id },
      {
        ...data,
        updatedBy: MongooseRepository.getCurrentUser(options).id,
      },
      options
    );

    record = await this.findById(id, options);

    return record;
  }

  static async destroy(id, options: IRepositoryOptions) {
    let record = await MongooseRepository.wrapWithSessionIfExists(
      Consumption(options.database).findOne({
        _id: id,
      }),
      options
    );

    if (!record) {
      throw new Error404();
    }

    await Consumption(options.database).deleteOne({ _id: id }, options);
  }

  static async count(filter, options: IRepositoryOptions) {
    return MongooseRepository.wrapWithSessionIfExists(
      Consumption(options.database).countDocuments({
        ...filter,
      }),
      options
    );
  }

  static async findById(id, options: IRepositoryOptions) {
    let record = await MongooseRepository.wrapWithSessionIfExists(
      Consumption(options.database).findOne({ _id: id }),
      options
    );

    if (!record) {
      throw new Error404();
    }

    return this._mapRelationshipsAndFileDownloadUrl(record);
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

      if (filter.status) {
        criteriaAnd.push({
          ['name']: { $eq: filter.name },
        });
      }
    }

    const sort = MongooseQueryUtils.sort(orderBy || 'createdAt_DESC');

    const skip = Number(offset || 0) || undefined;
    const limitEscaped = Number(limit || 0) || undefined;
    const criteria = criteriaAnd.length ? { $and: criteriaAnd } : null;

    let rows = await MongooseRepository.wrapWithSessionIfExists(
      Consumption(options.database)
        .find(criteria)
        .skip(skip)
        .limit(limitEscaped)
        .sort(sort),
      options
    );

    const count = await MongooseRepository.wrapWithSessionIfExists(
      Consumption(options.database).countDocuments(criteria),
      options
    );

    rows = await Promise.all(
      rows.map(row => this._mapRelationshipsAndFileDownloadUrl(row))
    );

    return { rows, count };
  }

  static async _mapRelationshipsAndFileDownloadUrl(record) {
    if (!record) {
      return null;
    }

    const output = record.toObject ? record.toObject() : record;

    return output;
  }
}

export default ConsumptionRepository;
