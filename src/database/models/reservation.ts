import mongoose from 'mongoose';
import ReservationConsumptionSchema from './schemas/reservationConsumptionSchema';
const Schema = mongoose.Schema;

export default database => {
  try {
    return database.model('reservation');
  } catch (error) {}

  const ReservationSchema = new Schema(
    {
      name: {
        type: String,
        maxlength: 255,
      },
      email: {
        type: String,
        maxlength: 255,
        required: true,
      },
      cpf: {
        type: String,
        maxlength: 255,
      },
      province: {
        type: String,
        maxlength: 63,
      },
      city: {
        type: String,
        maxlenght: 63,
      },
      street: {
        type: String,
        maxlength: 63,
      },
      zipCode: {
        type: String,
        maxlength: 63,
      },
      consumptions: [ReservationConsumptionSchema],
      documents: [
        {
          type: Schema.Types.ObjectId,
          ref: 'file',
        },
      ],
      createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'user',
      },
      status: {
        type: String,
        enum: ['checkin', 'checkout'],
        default: 'checkin',
      },
      cost: {
        type: Number,
        default: 0,
      },
    },
    {
      timestamps: true,
    }
  );

  ReservationSchema.virtual('id').get(function () {
    return this._id.toHexString();
  });

  ReservationSchema.set('toJSON', {
    getters: true,
  });

  ReservationSchema.set('toObject', {
    getters: true,
  });

  return database.model('reservation', ReservationSchema);
};
