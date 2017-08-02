const querystring = require('querystring');
const request = require('./util/request');
const { Book } = require('../models');

// TODO: bulk import and then query _our_ books
exports.search = ({ limit, page, query }) => {
  return request
    .get({
      url: 'https://www.googleapis.com/books/v1/volumes',
      headers: {
        Accept: 'application/json',
      },
      params: {
        q: query,
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
    .then(r => {
      // TODO: all of this goes away when we
      // can query our own books collection
      exports.importBooks(r.items);
      return Object.assign(r, {
        items: r.items.map(exports.gapiBookToBook)
      });
    })
    .then(({ totalItems, items }) => {
      let next;

      if (totalItems > page * limit) {
        next =
          `${process.env.API_BASE}/books/search?` +
          querystring.stringify({
            page: page + 1,
            query,
            limit,
          });
      }

      return {
        // Uri to next page of results
        next,
        // Total items available
        totalItems,
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
