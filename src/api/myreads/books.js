const { Router } = require('express');
const router = (module.exports = new Router());
const validate = require('../middleware/validate');
const bookService = require('./service/book');
const shelvedBookService = require('./service/shelvedBook');

router.use(validate.middleware());

router.use((req, res, next) => {
  res.locals.authorization = req.header('authorization');
  next();
});

/**
 * @api {get} /books/search - Search for books
 * @apiParam {string} query - Full-text search query string
 * @apiParam {number} [page] - Page of results to return, should be used
 *                             along with the limit param
 * @apiParam {number} [limit] - Max number of results to return
 */
router.get(
  '/books/search',
  validate.query({
    query: {
      notEmpty: true,
    },
    page: {
      optional: true,
      isNumeric: true,
    },
    limit: {
      optional: true,
      isNumeric: true,
    },
  }),
  (req, res, next) => {
    const { authorization } = res.locals;
    let { query, page, limit } = req.query;

    page |= 0;
    limit = (limit |= 0) || 20;

    bookService
      .search({
        query,
        page,
        limit,
      })
      .then(r =>
        shelvedBookService
          .maybeMapShelvedBooks({
            authorization,
            books: r.items,
          })
          .then(books => Object.assign(r, { items: books }))
      )
      .then(r => res.json(r))
      .catch(next);
  }
);

/**
 * @api {get} /books/:_id - Fetch a book by _id
 * @apiParam {string} _id - Id of the book to retrieve
 */
router.get(
  '/books/:_id',
  validate({
    _id: {
      in: 'params',
      notEmpty: true,
    },
  }),
  (req, res, next) => {
    const { authorization } = res.locals;
    const { _id } = req.params;

    bookService
      .findOne({
        query: {
          _id,
        },
      })
      .then(book =>
        shelvedBookService.maybeMapShelvedBooks({
          authorization,
          books: book,
        })
      )
      .then(r => res.json(r))
      .catch(next);
  }
);
