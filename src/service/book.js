const escapeRegExp = require('escape-string-regexp');
const { Book } = require('../models');

exports.search = ({ limit, query }) => {
  const options = {
    lean: true,
    limit,
  };
  query = {
    $text: { $search: query },
  };
  return Book.find(query, {}, options).then(items => {
    return {
      // Search result
      items,
    };
  });
};

exports.findOne = opt => {
  return exports.find(opt).then(r => r[0]);
};

exports.find = ({
  query,
  project = null,
  options = {
    lean: true,
  },
}) => {
  return Book.find(query, project, options);
};
