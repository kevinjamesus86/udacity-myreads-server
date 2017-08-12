const { Router } = require('express');
const router = (module.exports = new Router());
const bodyParser = require('body-parser');
const validate = require('../middleware/validate');
const { Category, Post } = require('./models');
const slugify = require('slugify');
const omitAuth = require('./util/omit-auth');

// GET /categories
// USAGE:
// Get all of the categories available for the app. List is found in categories.js.
// Feel free to extend this list as you desire.
router.get('/categories', (req, res, next) => {
  const { auth } = res.locals;

  Category.find(
    {
      auth: auth || {
        $exists: false,
      },
    },
    {},
    {
      lean: true,
    }
  )
    .then(categories => res.json(categories))
    .catch(next);
});

// GET /categories/:_id/posts
// USAGE:
// Get all of the posts for a particular category _id
router.get(
  '/categories/:_id/posts',
  validate({
    _id: {
      in: 'params',
      isMongoId: true,
    },
  }),
  (req, res, next) => {
    const { auth } = res.locals;
    const { _id: categoryId } = req.params;

    Category.findOne(
      {
        _id: categoryId,
        auth: auth || {
          $exists: false,
        },
      },
      `_id`,
      {
        lean: true,
      }
    )
      .then(
        category =>
          category ||
          // 404 NOT FOUND
          // https://httpstatuses.com/404
          Promise.reject({
            status: 404,
            message: `Unable to GET Posts, Category<${categoryId}> does not exist.`,
          })
      )
      .then(() =>
        Post.find(
          {
            categoryId,
            deleted: false,
          },
          {},
          {
            lean: true,
          }
        )
      )
      .then(posts => res.json(posts))
      .catch(next);
  }
);

// POST /categories
// USAGE:
// Create a new category
//
// PARAMS:
// name - String
router.post(
  '/categories',
  bodyParser.json(),
  validate({
    name: {
      in: 'body',
      notEmpty: true,
    },
  }),
  (req, res, next) => {
    const { auth } = res.locals;
    const { name } = req.body;

    Category.create({
      auth,
      name,
      path: slugify(name),
    })
      .then(omitAuth)
      .then(category => res.json(category))
      .catch(next);
  }
);
