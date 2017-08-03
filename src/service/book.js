const { Book } = require('../models');

exports.search = ({ limit, query }) => {
  const projection = { score: { $meta: 'textScore' } };
  const options = {
    lean: true,
    limit,
  };
  query = {
    $text: { $search: query },
  };
  return Book.find(query, projection, options)
    .sort({ score: { $meta: 'textScore' } })
    .then(items => {
      return {
        // Search result
        items,
      };
    });
};

exports.findOne = opt => {
  return exports.find(opt).then(r => r[0]);
};

exports.find = ({
  query,
  project = null,
  options = {
    lean: true,
  },
}) => {
  return Book.find(query, project, options);
};

///////////////////
///////////////////

exports.gapiBookToBook = ({ id, volumeInfo }) => {
  return new Book({
    _id: id,
    links: {
      self: `${process.env.API_ORIGIN}/api/books/${id}`,
    },
    title: volumeInfo.title,
    subtitle: volumeInfo.subtitle,
    pageCount: volumeInfo.pageCount,
    authors: volumeInfo.authors,
    categories: volumeInfo.categories,
    publisher: volumeInfo.publisher,
    publishedDate: volumeInfo.publishedDate,
    description: volumeInfo.description,
    thumbnailHref:
      volumeInfo.imageLinks &&
      (volumeInfo.imageLinks.thumbnail || volumeInfo.imageLinks.smallThumbnail),
  }).toJSON();
};

exports.importBooks = books => {
  const requestIds = books.map(book => book.id);
  return Book.find({ _id: { $in: requestIds } }, `_id`, {
    lean: true,
  })
    .then(docs => {
      // We need to import some books
      if (docs.length !== books.length) {
        // Books we have
        const ownIds = new Set(docs.map(doc => doc.id));

        // Books we need
        const booksToBulkWrite = books
          .filter(book => !ownIds.has(book.id))
          // BulkWrite doesn't care about our schema
          .map(exports.gapiBookToBook);

        // Doit
        return Book.bulkWrite(
          booksToBulkWrite.map(book => ({
            updateOne: {
              filter: { _id: book._id },
              update: book,
              upsert: true,
            },
          }))
        );
      }
    })
    .catch(err => {
      console.error('BulkWrite op failure:', err);
    });
};
