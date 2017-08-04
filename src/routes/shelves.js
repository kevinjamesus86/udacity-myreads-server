const { Router } = require('express');
const router = (module.exports = new Router());
const bodyParser = require('body-parser');
const validate = require('./middleware/validate');
const shelvedBook = require('../service/shelvedBook');

router.use(
  validate.middleware(),
  validate({
    authorization: {
      in: 'headers',
      notEmpty: true,
    },
  })
);

router.use((req, res, next) => {
  res.locals.authorization = req.header('authorization');
  next();
});

/**
 * @api {get} /shelved-books Get shelved books
 */
router.get('/shelved-books', (req, res, next) => {
  let { authorization } = res.locals;

  shelvedBook
    .find({
      query: {
        authorization,
        shelf: {
          $ne: 'none',
        },
      },
    })
    .then(r => res.json(r))
    .catch(next);
});

/**
 * @api {get} /shelved-books/:_id - Update a books shelf by id
 * @apiParam {string} _id - Id of the book to update
 * @apiParam {string} shelf - Books new shelf
 */
router.patch(
  '/shelved-books/:_id',
  bodyParser.json(),
  validate({
    _id: {
      in: 'params',
      notEmpty: true,
    },
    shelf: {
      in: 'body',
      notEmpty: true,
    },
  }),
  (req, res, next) => {
    const { authorization } = res.locals;
    const { _id: book } = req.params;
    const { shelf } = req.body;

    shelvedBook
      .update({
        query: {
          book,
          authorization,
        },
        data: {
          shelf,
          book,
          authorization,
        },
      })
      .then(r => res.json(r))
      .catch(next);
  }
);
