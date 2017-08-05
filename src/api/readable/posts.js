const { Router } = require('express');
const router = (module.exports = new Router());
const bodyParser = require('body-parser');
const validate = require('../middleware/validate');
const { Category, Post, Comment } = require('./models');

// GET /posts
// USAGE:
// Get all of the posts. Useful for the main page when no category is selected.
router.get('/posts', (req, res, next) => {
  const { auth } = res.locals;

  Post.find(
    {
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
});

// GET /posts/:_id
// USAGE:
// Get the details of a single post
router.get(
  '/posts/:_id',
  validate({
    _id: {
      in: 'params',
      isMongoId: true,
    },
  }),
  (req, res, next) => {
    const { auth } = res.locals;
    const { _id } = req.params;

    Post.findOne(
      {
        _id,
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
      .then(post => res.json(post))
      .catch(next);
  }
);

// GET /posts/:_id/comments
// USAGE:
// Get all the comments for a single post
router.get(
  '/posts/:_id/comments',
  validate({
    _id: {
      in: 'params',
      isMongoId: true,
    },
  }),
  (req, res, next) => {
    const { auth } = res.locals;
    const { _id: parentId } = req.params;

    Comment.find(
      {
        parentId,
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
      .then(comments => res.json(comments))
      .catch(next);
  }
);

// POST /posts
// USAGE:
// Add a new post
//
// PARAMS:
// title - String
// body - String
// owner - String
// categoryId - String<MongoId> # Must exist in the categories collection
router.post(
  '/posts',
  bodyParser.json(),
  validate({
    title: {
      in: 'body',
      notEmpty: true,
    },
    body: {
      in: 'body',
      notEmpty: true,
    },
    owner: {
      in: 'body',
      notEmpty: true,
    },
    categoryId: {
      in: 'body',
      isMongoId: true,
    },
  }),
  (req, res, next) => {
    const { auth } = res.locals;
    const { title, body, owner, categoryId } = req.body;

    // Assert that the category exists
    // FKs would be nice here..
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
        cat =>
          cat ||
          // 422 UNPROCESSABLE ENTITY
          // https://httpstatuses.com/422
          Promise.reject({
            status: 422,
            message: `Unable to create Post, Category<${categoryId}> does not exist.`,
          })
      )
      .then(() =>
        Post.create({
          auth,
          title,
          body,
          owner,
          categoryId,
        })
      )
      .then(post =>
        // Update the post count for this category
        Category.findOneAndUpdate(
          // Doc to update
          {
            _id: categoryId,
            auth: auth || {
              $exists: false,
            },
          },
          // Changes to apply
          {
            $inc: {
              numberOfPosts: 1,
            },
          },
          {
            // Return modified doc
            new: true,
            // Projection
            select: '_id numberOfPosts',
          }
        ).then(category => ({
          category,
          post,
        }))
      )
      .then(ret => res.json(ret))
      .catch(next);
  }
);

// PATCH /posts/:_id
// USAGE:
// Edit the details of an existing post
//
// PARAMS:
// title - String
// body - String
router.patch(
  '/posts/:_id',
  bodyParser.json(),
  validate({
    _id: {
      in: 'params',
      isMongoId: true,
    },
    title: {
      in: 'body',
      notEmpty: true,
    },
    body: {
      in: 'body',
      notEmpty: true,
    },
  }),
  (req, res, next) => {
    const { auth } = res.locals;
    const { _id } = req.params;
    const { title, body } = req.body;

    const q = Post.findOneAndUpdate(
      // Doc to update
      {
        _id,
        auth: auth || {
          $exists: false,
        },
      },
      // Changes to apply
      {
        title,
        body,
      },
      {
        // Return modified doc
        new: true,
        // Projection
        fields: `_id title body`,
      }
    );

    q.setOptions({ lean: true });

    q.then(post => res.json(post)).catch(next);
  }
);

// PATCH /posts/:_id/vote
// USAGE:
// Used for voting on a post
//
// PARAMS:
// option - String: Either "upVote" or "downVote"
router.patch(
  '/posts/:_id/vote',
  bodyParser.json(),
  validate({
    _id: {
      in: 'params',
      isMongoId: true,
    },
    option: {
      in: 'body',
      matches: {
        options: /^(upVote|downVote)$/,
      },
    },
  }),
  (req, res, next) => {
    const { auth } = res.locals;
    const { _id } = req.params;
    const { option } = req.body;

    const q = Post.findOneAndUpdate(
      // Doc to update
      {
        _id,
        auth: auth || {
          $exists: false,
        },
      },
      // Changes to apply
      {
        $inc: {
          voteScore: option === 'upVote' ? 1 : -1,
        },
      },
      {
        // Return modified doc
        new: true,
        // Projection
        select: '_id voteScore',
      }
    );

    q.setOptions({ lean: true });

    q.then(post => res.json(post)).catch(next);
  }
);

// DELETE /posts/:_id
// USAGE:
// Sets the deleted flag for a post to 'true'.
// Sets the parentDeleted flag for all child comments to 'true'.
router.delete(
  '/posts/:_id',
  validate({
    _id: {
      in: 'params',
      isMongoId: true,
    },
  }),
  async (req, res, next) => {
    const { auth } = res.locals;
    const { _id } = req.params;

    const updates = Promise.all([
      Post.findOneAndUpdate(
        // Doc to update
        {
          _id,
          auth: auth || {
            $exists: false,
          },
        },
        // Changes to apply
        {
          deleted: true,
        },
        {
          // Return modified doc
          new: true,
          // Projection
          fields: `_id`,
        }
      ),
      Comment.update(
        // Doc to update
        {
          parentId: _id,
          auth: auth || {
            $exists: false,
          },
        },
        // Changes to apply
        {
          parentDeleted: true,
        },
        {
          // Return modified doc
          new: true,
          // Update many
          multi: true,
          // Projection
          fields: `_id`,
        }
      ),
    ]);

    updates
      .then(([post, comments]) =>
        res.json({
          post,
          comments,
        })
      )
      .catch(next);
  }
);
