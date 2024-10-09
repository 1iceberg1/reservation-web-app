import { IServiceOptions } from './IServiceOptions';
import FileRepository from '../database/repositories/fileRepository';
import MongooseRepository from '../database/repositories/mongooseRepository';

export default class FileService {
  options: IServiceOptions;

  constructor(options) {
    this.options = options;
  }

  async create(data) {
    const session = await MongooseRepository.createSession(
      this.options.database
    );

    try {
      const record = FileRepository.create(data, {
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

  async update(id, data) {
    const session = await MongooseRepository.createSession(
      this.options.database
    );

    try {
      const record = FileRepository.create(data, {
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

  async findById(id) {
    return await FileRepository.findById(id, this.options);
  }
}
