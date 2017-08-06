const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookSchema = new Schema(
  {
    _id: {
      type: String,
    },

    term: {
      type: String,
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
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

bookSchema.index({ term: 1 });

bookSchema.index(
  {
    term: 'text',
    title: 'text',
    authors: 'text',
  },
  {
    weights: {
      term: 1.5,
    },
  }
);

const Book = mongoose.model('Book', bookSchema);

module.exports = {
  bookSchema,
  Book,
};
