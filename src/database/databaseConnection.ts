import mongoose from 'mongoose';
import { getConfig } from '../config';
import init from './models';

export async function databaseInit() {
  if (mongoose.connection.readyState) {
    return mongoose;
  }

  return mongoose
    .connect(getConfig().MONGODB_URL, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      // useCreateIndex: true,
      dbName: getConfig().MONGODB_DATABASE,
    })
    .then(() => {
      init(mongoose);
    })
    .then(() => mongoose)
    .catch(error => {
      console.error(error);

      throw error;
    });
}
