import mongoose from 'mongoose';
const Schema = mongoose.Schema;

export default database => {
  try {
    return database.model('consumption');
  } catch (error) {}

  const ConsumptionSchema = new Schema(
    {
      name: {
        type: String,
        maxlength: 63,
      },
      description: {
        type: String,
        maxlength: 256,
      },
      price: {
        type: Number,
        default: 0,
      },
    },
    {
      timestamps: true,
    }
  );

  ConsumptionSchema.virtual('id').get(function () {
    return this._id.toHexString();
  });

  ConsumptionSchema.set('toJSON', {
    getters: true,
  });

  ConsumptionSchema.set('toObject', {
    getters: true,
  });

  return database.model('consumption', ConsumptionSchema);
};
