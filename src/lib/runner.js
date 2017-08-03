const request = require('./util/request');
const { Book } = require('../../src/models');

exports.fetchBooks = ({ term }) => {
  console.log(`Fetching:`, { term });
  return request
    .get({
      url: 'https://www.googleapis.com/books/v1/volumes',
      headers: {
        Accept: 'application/json',
      },
      params: {
        q: term,
        maxResults: 30,
        printType: 'books',
        langRestrict: 'en',
      },
    })
    .then(r => JSON.parse(r))
    .then(arg => arg.items || Promise.reject(arg))
    .then(filterLegitGapiBooks)
    .then(mapAssign({ term }))
    .then(mapGapiBooksToBooks)
    .then(mapDedupeTitles)
    .then(importGapiBooks);
};

const filterLegitGapiBooks = books => {
  return books.filter(
    ({ volumeInfo }) =>
      volumeInfo &&
      volumeInfo.title &&
      volumeInfo.authors &&
      volumeInfo.publishedDate &&
      volumeInfo.description &&
      volumeInfo.imageLinks
  );
};

const mapAssign = props => items =>
  items.map(item => Object.assign(item, props));

const mapGapiBooksToBooks = books => {
  return books.map(({ id, term, volumeInfo }) =>
    new Book({
      _id: id,
      term: term,
      title: volumeInfo.title.trim(),
      subtitle: volumeInfo.subtitle,
      pageCount: volumeInfo.pageCount,
      authors: volumeInfo.authors,
      categories: volumeInfo.categories,
      publisher: volumeInfo.publisher,
      publishedDate: volumeInfo.publishedDate,
      description: volumeInfo.description,
      thumbnailHref:
        volumeInfo.imageLinks.thumbnail || volumeInfo.imageLinks.smallThumbnail,
    }).toJSON()
  );
};

const mapDedupeTitles = books => {
  const entries = books.map(b => [b.title, b]);
  return [...new Map(entries).values()];
};

const importGapiBooks = books => {
  const upsertedZero = {
    upsertedCount: 0,
  };

  if (!books.length) {
    return Promise.resolve(upsertedZero);
  }

  return Book.find(
    {
      $or: [
        {
          _id: {
            $in: books.map(b => b._id),
          },
        },
        {
          title: {
            $in: books.map(b => b.title),
          },
        },
      ],
    },
    `_id title`,
    {
      lean: true,
    }
  )
    .then(docs => {
      // We need to import some books
      if (docs.length < books.length) {
        // Books we have by id
        const ownIds = new Set(docs.map(doc => doc._id));

        // Books we have by title
        const ownTitles = new Set(docs.map(doc => doc.title));

        // Books we need
        const booksToBulkWrite = books.filter(
          book =>
            // We don't have this one by id
            !ownIds.has(book._id) &&
            // One word title, otherwise don't duplicate
            (!book.title.match(/\s/) || !ownTitles.has(book.title))
        );

        console.log(
          `UpsertingBooks: ${booksToBulkWrite.length} books to upsert`
        );

        // Doit
        return booksToBulkWrite.length
          ? Book.bulkWrite(
              booksToBulkWrite.map(book => ({
                updateOne: {
                  filter: { _id: book._id },
                  update: book,
                  upsert: true,
                },
              }))
            )
          : upsertedZero;
      }
      // no doc
      return upsertedZero;
    })
    .then(r => r.upsertedCount)
    .catch(err => {
      console.error('BulkWrite op failure:', err);
      return Promise.reject(err);
    });
};
