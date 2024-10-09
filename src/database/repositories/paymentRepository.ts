import { IRepositoryOptions } from './IRepositoryOptions';
import Error404 from '../../errors/Error404';
import MongooseQueryUtils from '../utils/mongooseQueryUtils';
import MongooseRepository from './mongooseRepository';
import Payment from '../models/payment';

class PaymentRepository {
  static async create(data, options: IRepositoryOptions) {
    const [record] = await Payment(options.database).create([data], options);

    return this.findById(record.id, options);
  }

  static async update(id, data, options: IRepositoryOptions) {
    let record = await MongooseRepository.wrapWithSessionIfExists(
      Payment(options.database).findOne({
        _id: id,
      }),
      options
    );

    if (!record) {
      throw new Error404();
    }

    await Payment(options.database).updateOne({ _id: id }, data, options);

    record = await this.findById(id, options);

    return record;
  }

  static async destroy(id, options: IRepositoryOptions) {
    let record = await MongooseRepository.wrapWithSessionIfExists(
      Payment(options.database).findOne({
        _id: id,
      }),
      options
    );

    if (!record) {
      throw new Error404();
    }

    await Payment(options.database).deleteOne({ _id: id }, options);
  }

  static async count(filter, options: IRepositoryOptions) {
    return MongooseRepository.wrapWithSessionIfExists(
      Payment(options.database).countDocuments({
        ...filter,
      }),
      options
    );
  }

  static async findById(id, options: IRepositoryOptions) {
    let record = await MongooseRepository.wrapWithSessionIfExists(
      Payment(options.database).findOne({ _id: id }),
      options
    );

    if (!record) {
      throw new Error404();
    }

    return this._mapToObject(record);
  }

  static async findByConfirmationId(
    confirmationId: string,
    options: IRepositoryOptions
  ) {
    const criteria = {
      confirmationId,
    };

    // Find the payment record by confirmationId
    let record = await MongooseRepository.wrapWithSessionIfExists(
      Payment(options.database).findOne(criteria).populate('reservation'),
      options
    );

    if (!record) {
      throw new Error404();
    }

    return this._mapToObject(record);
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

      if (filter.createdBy) {
        criteriaAnd.push({
          createdBy: MongooseQueryUtils.uuid(filter.createdBy),
        });
      }

      if (filter.reservation) {
        criteriaAnd.push({
          reservation: MongooseQueryUtils.uuid(filter.reservation),
        });
      }

      if (filter.status) {
        criteriaAnd.push({
          status: filter.status,
        });
      }
    }

    const sort = MongooseQueryUtils.sort(orderBy || 'createdAt_DESC');

    const skip = Number(offset || 0) || undefined;
    const limitEscaped = Number(limit || 0) || undefined;
    const criteria = criteriaAnd.length ? { $and: criteriaAnd } : null;

    let rows = await MongooseRepository.wrapWithSessionIfExists(
      Payment(options.database)
        .find(criteria)
        .skip(skip)
        .limit(limitEscaped)
        .sort(sort),
      options
    );

    const count = await MongooseRepository.wrapWithSessionIfExists(
      Payment(options.database).countDocuments(criteria),
      options
    );

    rows = await Promise.all(rows.map(row => this._mapToObject(row)));

    return { rows, count };
  }

  static async _mapToObject(record) {
    if (!record) {
      return null;
    }

    const output = record.toObject ? record.toObject() : record;

    return output;
  }
}

export default PaymentRepository;
