const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookSchema = new Schema(
  {
    _id: {
      type: String,
      required: true,
      index: {
        unique: true,
      },
    },

    links: {
      self: {
        type: String,
      },
    },

    title: {
      type: String,
    },

    subtitle: {
      type: String,
    },

    pageCount: {
      type: Number,
    },

    authors: {
      type: [String],
      default: [],
    },

    categories: {
      type: [String],
      default: [],
    },

    publisher: {
      type: String,
      default: '',
    },

    publishedDate: {
      type: String,
      default: '',
    },

    description: {
      type: String,
      default: '',
    },

    thumbnailHref: {
      type: String,
    },
  },
  {
    versionKey: false,
  }
);

const Book = mongoose.model('Book', bookSchema);

module.exports = {
  bookSchema,
  Book,
};
