import { IRepositoryOptions } from './IRepositoryOptions';
import Error404 from '../../errors/Error404';
import MongooseQueryUtils from '../utils/mongooseQueryUtils';
import MongooseRepository from './mongooseRepository';
import Reservation from '../models/reservation';
import FileRepository from './fileRepository';
import UserRepository from './userRepository';
import ConsumptionRepository from './consumptionRepository';

class ReservationRepository {
  static async updateTotalCost(reservationId, options: IRepositoryOptions) {
    let totalCost = 0;
    const reservation = await this.findById(reservationId, options);

    if (reservation.consumptions) {
      for (const consumption of reservation.consumptions) {
        // Assuming each consumption has an ID and amount
        const consumptionDoc = await ConsumptionRepository.findById(
          consumption?.consumption?.id || '',
          options
        ); // Fetch the consumption document
        if (consumptionDoc) {
          totalCost +=
            (consumptionDoc.price ?? 0) * (consumption?.quantity ?? 0); // Calculate total cost
        }
      }
    }

    reservation.cost = totalCost;

    await Reservation(options.database).updateOne(
      { _id: reservationId },
      reservation,
      options
    );
  }

  static async create(data, options: IRepositoryOptions) {
    const [record] = await Reservation(options.database).create(
      [data],
      options
    );

    await this.updateTotalCost(record.id, options);

    return this.findById(record.id, options);
  }

  static async update(id, data, options: IRepositoryOptions) {
    let record = await MongooseRepository.wrapWithSessionIfExists(
      Reservation(options.database).findOne({
        _id: id,
      }),
      options
    );

    if (!record) {
      throw new Error404();
    }

    await Reservation(options.database).updateOne({ _id: id }, data, options);

    await this.updateTotalCost(id, options);

    record = await this.findById(id, options);

    return record;
  }

  static async destroy(id, options: IRepositoryOptions) {
    let record = await MongooseRepository.wrapWithSessionIfExists(
      Reservation(options.database).findOne({
        _id: id,
      }),
      options
    );

    if (!record) {
      throw new Error404();
    }

    await Reservation(options.database).deleteOne({ _id: id }, options);
  }

  static async count(filter, options: IRepositoryOptions) {
    return MongooseRepository.wrapWithSessionIfExists(
      Reservation(options.database).countDocuments({
        ...filter,
      }),
      options
    );
  }

  static async findById(id, options: IRepositoryOptions) {
    let record = await MongooseRepository.wrapWithSessionIfExists(
      Reservation(options.database)
        .findOne({ _id: id })
        .populate('documents')
        .populate('consumptions.consumption')
        .populate({
          path: 'createdBy',
          populate: {
            path: 'avatar',
          },
        }),
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
          ['createdBy']: MongooseQueryUtils.uuid(filter.createdBy),
        });
      }

      if (filter.status) {
        criteriaAnd.push({
          ['status']: filter.status,
        });
      }
    }

    const sort = MongooseQueryUtils.sort(orderBy || 'createdAt_DESC');

    const skip = Number(offset || 0) || undefined;
    const limitEscaped = Number(limit || 0) || undefined;
    const criteria = criteriaAnd.length ? { $and: criteriaAnd } : null;

    let rows = await MongooseRepository.wrapWithSessionIfExists(
      Reservation(options.database)
        .find(criteria)
        .skip(skip)
        .limit(limitEscaped)
        .sort(sort)
        .populate('documents')
        .populate('consumptions.consumption')
        .populate({
          path: 'createdBy',
          populate: {
            path: 'avatar',
          },
        }),
      options
    );

    const count = await MongooseRepository.wrapWithSessionIfExists(
      Reservation(options.database).countDocuments(criteria),
      options
    );

    rows = await Promise.all(rows.map(row => this._mapToObject(row)));

    return { rows, count };
  }

  static async findAllAutocomplete(search, limit, options: IRepositoryOptions) {
    let criteriaAnd: Array<any> = [];

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
        ],
      });
    }

    const sort = MongooseQueryUtils.sort('title_ASC');
    const limitEscaped = Number(limit || 0) || undefined;

    const criteria = criteriaAnd.length ? { $and: criteriaAnd } : null;

    const records = await Reservation(options.database)
      .find(criteria)
      .limit(limitEscaped)
      .sort(sort)
      .select(['_id', 'name']);

    return records.map(record => ({
      id: record.id,
      label: record.name,
    }));
  }

  static async _mapToObject(record) {
    if (!record) {
      return null;
    }

    const output = record.toObject ? record.toObject() : record;

    const documents = await FileRepository.cleanupForRelationships(
      output.documents
    );

    const createdBy = await UserRepository._fillRelationsAndFileDownloadUrls(
      output.createdBy
    );

    output.documents = documents ?? [];

    output.createdBy = createdBy ?? null;

    return output;
  }
}

export default ReservationRepository;
