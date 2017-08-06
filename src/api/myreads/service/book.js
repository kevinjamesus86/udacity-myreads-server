const { Book } = require('../models');

exports.search = ({ page, limit, query }) => {
  return Book.aggregate([
    {
      $match: {
        $text: { $search: query },
      },
    },
    {
      $group: {
        _id: null,
        totalItems: { $sum: 1 },
        items: { $push: '$$ROOT' },
      },
    },
    {
      $project: {
        totalItems: 1,
        items: {
          $slice: ['$items', page * limit, limit],
        },
      },
    },
  ]).then(([{ totalItems, items }]) => ({
    totalItems,
    items,
  }));
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
