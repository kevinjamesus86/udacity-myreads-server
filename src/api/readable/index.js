const { Router } = require('express');
const router = (module.exports = new Router());
const validate = require('../middleware/validate');

router.use(
  // Root route
  '/readable',
  // Wire up request validator
  validate.middleware(),
  // Stuff the authorization token into the response's
  // locals object so we don't need to do this in each
  // route file
  (req, res, next) => {
    res.locals.auth = req.header('authorization');
    next();
  },
  // For first time visits, this will seed the DB for the
  // [authed] user with some categories, posts, and comments
  require('./_init/seed'),
  // Routes
  require('./categories'),
  require('./posts'),
  require('./comments')
);
