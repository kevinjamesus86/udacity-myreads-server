const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const shelvedBookSchema = new Schema(
  {
    authorization: {
      type: String,
      select: false,
    },

    shelf: {
      type: String,
      default: 'none',
    },

    book: {
      type: String,
      ref: 'Book',
    },
  },
  {
    versionKey: false,
  }
);

const ShelvedBook = mongoose.model('ShelvedBook', shelvedBookSchema);

module.exports = {
  shelvedBookSchema,
  ShelvedBook,
};
