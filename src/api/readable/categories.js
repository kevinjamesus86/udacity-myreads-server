const { Router } = require('express');
const router = (module.exports = new Router());
const validate = require('../middleware/validate');
const { Category, Post } = require('./models');
const slugify = require('slugify');

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

    Post.find(
      {
        categoryId,
        deleted: false,
        auth: auth || {
          $exists: false,
        },
      },
      {},
      {
        lean: true,
      }
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
      .then(category => res.json(category))
      .catch(next);
  }
);
