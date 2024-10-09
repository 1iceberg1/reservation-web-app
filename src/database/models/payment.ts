import mongoose from 'mongoose';
const Schema = mongoose.Schema;

export default database => {
  try {
    return database.model('payment');
  } catch (error) {}

  const PaymentSchema = new Schema(
    {
      confirmationId: {
        type: String,
        maxlength: 63,
      },
      reservation: {
        type: Schema.Types.ObjectId,
        ref: 'reservation',
      },
      createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'user',
      },
      amount: {
        type: Number,
        default: 0,
      },
      status: {
        type: String,
        default: 'pending',
        enum: ['pending', 'success', 'failed'],
      },
    },
    {
      timestamps: true,
    }
  );

  PaymentSchema.virtual('id').get(function () {
    return this._id.toHexString();
  });

  PaymentSchema.set('toJSON', {
    getters: true,
  });

  PaymentSchema.set('toObject', {
    getters: true,
  });

  // Create a compound unique index on createdBy and reservation
  PaymentSchema.index(
    { createdBy: 1, reservation: 1 },
    { unique: true, partialFilterExpression: { status: 'pending' } }
  );

  return database.model('payment', PaymentSchema);
};
