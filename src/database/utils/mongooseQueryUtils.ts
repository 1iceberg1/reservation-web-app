import moment from 'moment';
import mongoose from 'mongoose';
/**
 * Utilities to use on Mongoose queries.
 */
export default class MongooseQueryUtils {
  static ObjectId(value) {
    return mongoose.Types.ObjectId.createFromHexString(value);
  }
  static isValidObjectId(value) {
    return value && mongoose.Types.ObjectId.isValid(value);
  }
  /**
   * If you pass an invalid uuid to a query, it throws an exception.
   * To hack this behaviour, if the uuid is invalid, it creates a new one,
   * that won't match any of the database.
   * If the uuid is invalid, brings no results.
   */
  static uuid(value) {
    let id = value;

    // If ID is invalid, mongodb throws an error.
    // For that not to happen, if the ObjectID is invalid, it sets
    // some random ObjectID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      id = mongoose.Types.ObjectId.createFromTime(moment().unix());
    }

    return id;
  }

  /**
   * Some string values may break the RegExp used for queries.
   * This method escapes it.
   */
  static escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Returns the sort clause.
   */
  static sort(orderBy) {
    if (!orderBy) {
      return undefined;
    }

    let [column, order] = orderBy.split('_');

    if (column === 'id') {
      column = '_id';
    }

    return {
      [column]: order === 'ASC' ? 1 : -1,
    };
  }

  /**
   * Push the range criteria
   * @param criteria The criteria array.
   * @param filter JSON object for the criteria.
   * @param fields The string array for the criteria fields.
   */
  static pushRangeCriteria(criteria: any[], filter, fields: string[]) {
    fields.forEach(field => {
      if (filter[`${field}Range`]) {
        const [start, end] = filter[`${field}Range`];

        if (start !== undefined && start !== null && start !== '') {
          criteria.push({
            [field]: {
              $gte: start,
            },
          });
        }

        if (end !== undefined && end !== null && end !== '') {
          criteria.push({
            [field]: {
              $lte: end,
            },
          });
        }
      }
    });
  }
}
