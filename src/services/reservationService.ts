import MongooseRepository from '../database/repositories/mongooseRepository';
import { IServiceOptions } from './IServiceOptions';
import ReservationRepository from '../database/repositories/reservationRepository';

export default class ReservationService {
  options: IServiceOptions;

  constructor(options) {
    this.options = options;
  }

  async create(data) {
    const session = await MongooseRepository.createSession(
      this.options.database
    );

    const { currentUser } = this.options;

    try {
      const record = await ReservationRepository.create(
        { ...data, createdBy: currentUser.id },
        {
          ...this.options,
          session,
        }
      );

      await MongooseRepository.commitTransaction(session);

      return record;
    } catch (error) {
      await MongooseRepository.abortTransaction(session);

      MongooseRepository.handleUniqueFieldError(error);

      throw error;
    }
  }

  async update(id, data) {
    const session = await MongooseRepository.createSession(
      this.options.database
    );

    try {
      const record = await ReservationRepository.update(id, data, {
        ...this.options,
        session,
      });

      await MongooseRepository.commitTransaction(session);

      return record;
    } catch (error) {
      await MongooseRepository.abortTransaction(session);

      MongooseRepository.handleUniqueFieldError(error);

      throw error;
    }
  }

  async destroyAll(ids) {
    const session = await MongooseRepository.createSession(
      this.options.database
    );

    try {
      for (const id of ids) {
        await ReservationRepository.destroy(id, {
          ...this.options,
          session,
        });
      }

      await MongooseRepository.commitTransaction(session);
    } catch (error) {
      await MongooseRepository.abortTransaction(session);
      throw error;
    }
  }

  async findById(id) {
    return ReservationRepository.findById(id, this.options);
  }

  async findAllAutocomplete(search, limit) {
    return ReservationRepository.findAllAutocomplete(
      search,
      limit,
      this.options
    );
  }

  async findAndCountAll(args) {
    return ReservationRepository.findAndCountAll(args, this.options);
  }
}
