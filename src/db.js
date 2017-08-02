const mongoose = require('mongoose');

// Set mongoose Promise implementation
// http://mongoosejs.com/docs/promises.html
mongoose.Promise = global.Promise;

exports.connect = function(mongodbUri) {
  // Connect to mongo
  return mongoose.connect(mongodbUri, {
    useMongoClient: true,
  });
};
