import mongoose from 'mongoose';
const Schema = mongoose.Schema;

export default database => {
  try {
    return database.model('user');
  } catch (error) {}

  const UserSchema = new Schema(
    {
      name: { type: String, maxlength: 255 },
      email: {
        type: String,
        maxlength: 255,
        index: { unique: true },
        required: true,
      },
      password: {
        type: String,
        maxlength: 255,
        select: false,
      },
      phoneNumber: {
        type: String,
        maxlength: 63,
      },
      avatar: {
        type: Schema.Types.ObjectId,
        ref: 'file',
      },
      birthday: {
        type: String,
        maxlength: 63,
      },
      cpf: {
        type: String,
        maxlength: 63,
      },
      status: {
        type: String,
        enum: ['active', 'deactive'],
        default: 'active',
      },
      role: {
        type: String,
        enum: ['guest', 'admin'],
        default: 'guest',
      },
      province: {
        type: String,
        maxlength: 63,
      },
      city: {
        type: String,
        maxlength: 63,
      },
      street: {
        type: String,
        maxlength: 63,
      },
      zipCode: {
        type: String,
        maxlength: 63,
      },
    },
    {
      timestamps: true,
    }
  );

  UserSchema.virtual('id').get(function () {
    return this._id.toHexString();
  });

  UserSchema.set('toJSON', {
    getters: true,
  });

  UserSchema.set('toObject', {
    getters: true,
  });

  return database.model('user', UserSchema);
};
