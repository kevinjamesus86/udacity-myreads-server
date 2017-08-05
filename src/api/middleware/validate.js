const util = require('util');

function validatorFactory(location = '') {
  return schema => {
    return async (req, res, next) => {
      req[`check${location}`](schema);
      const validationResult = await req.getValidationResult();
      if (!validationResult.isEmpty()) {
        const errors = validationResult.mapped();
        const error = new Error(
          'There have been validation errors: ' + util.inspect(errors)
        );
        /**
         * 4xx Client Error
         * 400 Bad Request
         * https://httpstatuses.com/400
         */
        error.status = 400;
        next(error);
      } else {
        next();
      }
    };
  };
}

module.exports = validatorFactory();

Object.assign(module.exports, {
  middleware: require('express-validator'),
  body: validatorFactory('Body'),
  query: validatorFactory('Query'),
  params: validatorFactory('Params'),
  headers: validatorFactory('Headers'),
  cookies: validatorFactory('Cookies'),
});
