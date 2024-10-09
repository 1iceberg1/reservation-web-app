import mongoose from 'mongoose';
const Schema = mongoose.Schema;

export default database => {
  try {
    return database.model('file');
  } catch (error) {}

  const FileSchema = new Schema(
    {
      title: {
        type: String,
        maxlength: 255,
        required: true,
      },
      sizeInBytes: { type: Number },
      privateUrl: { type: String, maxlength: 2047 },
      publicUrl: {
        type: String,
        maxlength: 2047,
        required: false,
      },
    },
    {
      timestamps: true,
    }
  );

  FileSchema.virtual('id').get(function () {
    return this._id.toHexString();
  });

  FileSchema.set('toJSON', {
    getters: true,
  });

  FileSchema.set('toObject', {
    getters: true,
  });

  return database.model('file', FileSchema);
};
