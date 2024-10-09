import assert from 'assert';
import UserRepository from '../database/repositories/userRepository';
import Error400 from '../errors/Error400';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import MongooseRepository from '../database/repositories/mongooseRepository';
import FileRepository from '../database/repositories/fileRepository';
import { getConfig } from '../config';

const BCRYPT_SALT_ROUNDS = 12;

export default class AuthService {
  static async register(data, options: any = {}) {
    const session = await MongooseRepository.createSession(options.database);

    let { name, email, password, role } = data;

    try {
      email = email.toLowerCase();

      const existingUser = await UserRepository.findByEmail(email, options);

      // Generates a hashed password to hide the original one.
      const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

      // The user may already exist on the database in case it was invided.
      if (existingUser) {
        throw new Error400('Email Already In Use');
      }

      const newUser = await UserRepository.create(
        {
          name,
          password: hashedPassword,
          email,
          role,
        },
        {
          ...options,
          session,
        }
      );

      const token = jwt.sign({ id: newUser.id }, getConfig().AUTH_JWT_SECRET, {
        expiresIn: getConfig().AUTH_JWT_EXPIRES_IN,
      });

      await MongooseRepository.commitTransaction(session);

      return { accessToken: token, user: newUser };
    } catch (error) {
      await MongooseRepository.abortTransaction(session);

      throw error;
    }
  }

  static async findByEmail(email, options: any = {}) {
    email = email.toLowerCase();
    return UserRepository.findByEmail(email, options);
  }

  static async login(email, password, options: any = {}) {
    const session = await MongooseRepository.createSession(options.database);

    try {
      email = email.toLowerCase();
      const user = await UserRepository.findByEmail(email, options);

      if (!user) {
        throw new Error400(`Sorry, we don't recognize your credentials`);
      }

      const currentPassword = await UserRepository.findPassword(
        user.id,
        options
      );

      if (!currentPassword) {
        throw new Error400(`Sorry, we don't recognize your credentials`);
      }

      const passwordsMatch = await bcrypt.compare(password, currentPassword);

      if (!passwordsMatch) {
        throw new Error400(`Sorry, we don't recognize your credentials`);
      }

      const token = jwt.sign({ id: user.id }, getConfig().AUTH_JWT_SECRET, {
        expiresIn: getConfig().AUTH_JWT_EXPIRES_IN,
      });

      await MongooseRepository.commitTransaction(session);

      return { accessToken: token, user };
    } catch (error) {
      await MongooseRepository.abortTransaction(session);

      throw error;
    }
  }

  static async changePassword(oldPassword, newPassword, options) {
    const currentUser = options.currentUser;
    const currentPassword = await UserRepository.findPassword(
      options.currentUser.id,
      options
    );

    const passwordsMatch = await bcrypt.compare(oldPassword, currentPassword);

    if (!passwordsMatch) {
      throw new Error400('The old password is invalid');
    }

    const newHashedPassword = await bcrypt.hash(
      newPassword,
      BCRYPT_SALT_ROUNDS
    );

    return UserRepository.update(
      currentUser.id,
      {
        password: newHashedPassword,
      },
      options
    );
  }

  static async updateProfile(data, options) {
    this._validate(options);

    assert(data, 'profile is required');

    const session = await MongooseRepository.createSession(options.database);

    try {
      data.avatar = await FileRepository.filterId(data.avatar, {
        ...options,
        session,
      });

      await UserRepository.update(options.currentUser.id, data, {
        ...options,
        bypassPermissionValidation: true,
      });

      await MongooseRepository.commitTransaction(session);

      return true;
    } catch (error) {
      await MongooseRepository.abortTransaction(session);
      throw error;
    }
  }

  static async removeProfile(options) {
    this._validate(options);

    const session = await MongooseRepository.createSession(options.database);

    try {
      await UserRepository.destroy(options.currentUser.id, {
        ...options,
        bypassPermissionValidation: true,
      });

      await MongooseRepository.commitTransaction(session);

      return true;
    } catch (error) {
      await MongooseRepository.abortTransaction(session);
      throw error;
    }
  }

  static async findByToken(token, options) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, getConfig().AUTH_JWT_SECRET, (err, decoded) => {
        if (err) {
          reject(err);
          return;
        }
        const id = decoded.id;

        UserRepository.findById(id, {
          ...options,
          bypassPermissionValidation: true,
        })
          .then(user => {
            resolve(user);
          })
          .catch(error => reject(error));
      });
    });
  }

  static async _validate(options) {
    assert(options.currentUser, 'currentUser is required');
    assert(options.currentUser.id, 'currentUser.id is required');
    assert(options.currentUser.email, 'currentUser.email is required');
  }
}
