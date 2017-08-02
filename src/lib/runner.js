const request = require('./util/request');
const { Book } = require('../../src/models');

exports.fetchBooks = ({ term, page = 0, limit = 40 }) => {
  console.log(`Fetching `, { term, page, limit });
  return request
    .get({
      url: 'https://www.googleapis.com/books/v1/volumes',
      headers: {
        Accept: 'application/json',
      },
      params: {
        q: term,
        printType: 'books',
        orderBy: 'relevance',
        langRestrict: 'en',
        showPreorders: true,
        startIndex: page * limit,
        maxResults: limit,
        key: process.env.GAPI_BOOKS_API_KEY,
      },
    })
    .then(r => JSON.parse(r))
    .then(async arg => {
      const { items, totalItems } = arg;
      if (!items) return Promise.reject(arg);
      const { upsertedCount } = await importGapiBooks(items);
      return {
        totalItems,
        upsertedCount,
      };
    })
    .then(async ({ totalItems, upsertedCount }) => {
      return page < 1 && totalItems > page * limit
        ? // Recurse ! Bring in 2 pages of results if possible
          upsertedCount +
            (await exports.fetchBooks({
              page: page + 1,
              term,
              limit,
            }))
        : upsertedCount;
    });
};

const importGapiBooks = books => {
  const requestIds = books.map(book => book.id);
  return Book.find({ _id: { $in: requestIds } }, `_id`, {
    lean: true,
  })
    .then(docs => {
      // We need to import some books
      if (docs.length !== books.length) {
        // Books we have
        const ownIds = new Set(docs.map(doc => doc._id));

        // Books we need
        const booksToBulkWrite = books
          .filter(book => !ownIds.has(book.id))
          // BulkWrite doesn't care about our schema
          .map(gapiBookToBook);

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
      // no doc
      return {
        upsertedCount: 0,
      };
    })
    .catch(err => {
      console.error('BulkWrite op failure:', err);
      return Promise.reject(err);
    });
};

const gapiBookToBook = ({ id, volumeInfo }) => {
  return new Book({
    _id: id,
    links: {
      self: `${process.env.API_BASE}/books/${id}`,
    },
    title: volumeInfo.title,
    subtitle: volumeInfo.subtitle,
    pageCount: volumeInfo.pageCount,
    authors: volumeInfo.authors,
    categories: volumeInfo.categories,
    publisher: volumeInfo.publisher,
    publishedDate: volumeInfo.publishedDate,
    description: volumeInfo.description,
    thumbnailHref: volumeInfo.imageLinks &&
      (volumeInfo.imageLinks.thumbnail || volumeInfo.imageLinks.smallThumbnail),
  }).toJSON();
};
