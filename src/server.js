// get environment variables from .env
require('dotenv').config({
  silent: true,
});

const express = require('express');
const compression = require('compression');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');

// Export Promise<app>
module.exports = (async () => {
  const { connect } = require('./db');

  // If we can't connect to the database then
  // we don't need to do any of the work that follows
  try {
    await connect(
      process.env.NODE_ENV === 'test'
        ? process.env.MONGODB_TEST_URI
        : process.env.MONGODB_URI
    );
  } catch (e) {
    return console.error('Could not connect to mongo', e);
  }

  // Boom
  const app = express();

  ///////////////
  // API Config
  ///////////////

  // TODO: determine whether or not this
  // conflicts with express-ssl's default setting
  // for 'trust proxy'
  // https://github.com/jclem/express-ssl
  // https://github.com/jclem/express-ssl/blob/master/index.js#L22-L24
  // default is `false`
  app.enable('trust proxy');

  // Disable etags until we decide whether or not
  // we want to use them. Don't waste that CPU time
  app.disable('etag');

  // Logger
  // Suppress logging during tests
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined'));
  }

  // Security headers
  app.use(helmet());

  // Enable CORS
  const corsConfig = {
    // Some legacy browsers (IE11, various SmartTVs) choke on 204
    optionsSuccessStatus: 200,
  };

  app.options('*', cors(corsConfig));
  app.use(cors(corsConfig));

  // Compression ftw
  app.use(compression());

  // Actual routes
  app.use('/api', require('./routes'));

  // 404
  app.use(function(req, res) {
    res.status(404);
    res.end();
  });

  // Default error handling
  // note: `next` is unused but required, as this middleware
  // is recongnized as a * error handler based on the number of
  // arguments the function expects ( in this case, 4 )
  // eslint-disable-next-line no-unused-vars
  app.use(function handleError(error, req, res, next) {
    const status = error.status || 500;
    res.status(status);
    res.json({
      message: error.message,
      status,
    });
  });

  // Fire it up
  return new Promise(function(resolve, reject) {
    const port = process.env.PORT || 3000;
    app.listen(port, function(error) {
      if (error) reject(error);
      else {
        console.log('Express Server listening on port %s.', port);
        // For testing
        resolve(app);
      }
    });
  });
})();
