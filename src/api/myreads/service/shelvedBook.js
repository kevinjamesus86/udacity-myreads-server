const { ShelvedBook } = require('../models');

exports.find = ({
  query,
  populate = 'book',
  project = null,
  options = {
    lean: true,
  },
}) => {
  return ShelvedBook.find(query, project, options)
    .populate(populate)
    .then(exports.formatShelvedBookResult);
};

exports.update = ({
  query,
  data,
  populate = 'book',
  project = null,
  options = {
    lean: true,
  },
}) => {
  const q = ShelvedBook.findOneAndUpdate(
    // Doc to update
    query,
    // Changes to apply
    data,
    {
      // Return modified doc
      new: true,
      // Create if it doesn't exist
      upsert: true,
      // Fields to select
      fields: project,
    }
  );
  q.populate(populate);
  q.setOptions(options);
  return q.then(exports.formatShelvedBookResult);
};

//////////////
//////////////

exports.formatShelvedBookResult = result => {
  const format = item => {
    const { shelf, book } = item;
    switch (typeof book) {
      case 'object':
        return Object.assign({ shelf }, book);
      case 'string':
        return Object.assign({ shelf }, { _id: book });
      default:
        return item;
    }
  };
  return Array.isArray(result) ? result.map(format) : format(result);
};

exports.maybeMapShelvedBooks = ({ authorization, books }) => {
  return Promise.resolve(
    authorization
      ? exports.mapShelvedBooks({
          authorization,
          books,
        })
      : books
  );
};

exports.mapShelvedBooks = ({ authorization, books }) => {
  const isArray = Array.isArray(books);
  books = isArray ? books : [books];
  return exports
    .find({
      populate: '',
      project: 'book shelf',
      query: {
        authorization,
        book: {
          $in: books.map(b => b._id),
        },
      },
    })
    .then(shelved => {
      shelved = new Map(shelved.map(book => [book._id, book.shelf]));
      return books.map(book =>
        Object.assign(book, {
          shelf: shelved.get(book._id) || 'none',
        })
      );
    })
    .then(r => (isArray ? r : r[0]));
};
