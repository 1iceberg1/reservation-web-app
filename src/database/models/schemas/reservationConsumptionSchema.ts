import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const ReservationConsumptionSchema = new Schema({
  consumption: {
    type: Schema.Types.ObjectId,
    ref: 'consumption',
  },
  quantity: {
    type: Number,
    defaut: 0,
  },
});

ReservationConsumptionSchema.set('toJSON', {
  getters: true,
});

ReservationConsumptionSchema.set('toObject', {
  getters: true,
});

export default ReservationConsumptionSchema;
