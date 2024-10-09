import Error400 from '../../errors/Error400';
import MongooseRepository from '../../database/repositories/mongooseRepository';
import { IServiceOptions } from '../IServiceOptions';
import UserRepository from '../../database/repositories/userRepository';
import assert from 'assert';
import bcrypt from 'bcrypt';

const BCRYPT_SALT_ROUNDS = 12;

export default class UserService {
  options: IServiceOptions;

  constructor(options) {
    this.options = options;
  }

  async create(data) {
    this._validate();
    assert(data.email, 'email is required');

    const session = await MongooseRepository.createSession(
      this.options.database
    );

    try {
      const email = data.email.toLowerCase();

      const existingUser = await UserRepository.findByEmail(
        email,
        this.options
      );

      // The user may already exist on the database in case it was invided.
      if (existingUser) {
        throw new Error400('Email Already In Use');
      }

      const hashedPassword = await bcrypt.hash(
        data.password,
        BCRYPT_SALT_ROUNDS
      );

      const user = await UserRepository.create(
        { ...data, password: hashedPassword },
        {
          ...this.options,
          session,
        }
      );

      await MongooseRepository.commitTransaction(session);

      return user;
    } catch (error) {
      await MongooseRepository.abortTransaction(session);

      MongooseRepository.handleUniqueFieldError(error);

      throw error;
    }
  }

  async update(id, data) {
    this._validate();

    const session = await MongooseRepository.createSession(
      this.options.database
    );

    try {
      let user = await UserRepository.findById(id, {
        ...this.options,
        session,
      });

      if (!user) {
        throw new Error400('User not found');
      }

      let hashedPassword = '';
      if (data.password) {
        hashedPassword = await bcrypt.hash(data.password, BCRYPT_SALT_ROUNDS);
      }

      user = await UserRepository.update(
        id,
        { ...data, ...(hashedPassword && { password: hashedPassword }) },
        {
          ...this.options,
          session,
        }
      );

      await MongooseRepository.commitTransaction(session);

      return user;
    } catch (error) {
      await MongooseRepository.abortTransaction(session);

      MongooseRepository.handleUniqueFieldError(error);

      throw error;
    }
  }

  async destroyAll(ids) {
    this._validate();

    assert(ids && ids.length, 'ids is required');

    if (this._isRemovingHimself(ids)) {
      throw new Error400(`You can't delete yourself.`);
    }

    const session = await MongooseRepository.createSession(
      this.options.database
    );

    try {
      for (const id of ids) {
        const user = await UserRepository.findById(id, {
          ...this.options,
          session,
        });
        // if (user.status === 'deactive') {

        //   await UserRepository.update(
        //     id,
        //     {
        //       status: 'deactive',
        //     },
        //     this.options
        //   );
        // } else {
        //   await UserRepository.update(
        //     id,
        //     {
        //       status: 'deactive',
        //     },
        //     this.options
        //   );
        // }

        await UserRepository.destroy(id, {
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
    return UserRepository.findById(id, this.options);
  }

  async findAllAutocomplete(search, limit) {
    return UserRepository.findAllAutocomplete(search, limit, this.options);
  }

  async findAndCountAll(args) {
    return UserRepository.findAndCountAll(args, this.options);
  }

  _isRemovingHimself(ids) {
    return ids.includes(String(this.options.currentUser.id));
  }

  _validate() {
    assert(this.options.currentUser, 'currentUser is required');
    assert(this.options.currentUser.id, 'currentUser.id is required');
    assert(this.options.currentUser.email, 'currentUser.email is required');
  }
}
