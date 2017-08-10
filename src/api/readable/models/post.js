const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
  auth: {
    type: String,
    select: false,
  },

  timestamp: {
    type: Date,
    default: Date.now(),
  },

  title: {
    type: String,
    required: true,
  },

  body: {
    type: String,
    required: true,
  },

  author: {
    type: String,
    required: true,
  },

  category: {
    type: String,
  },

  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
  },

  voteScore: {
    type: Number,
    default: 1,
  },

  numberOfComments: {
    type: Number,
    default: 0,
  },

  deleted: {
    type: Boolean,
    default: false,
    select: false,
  },
});

const Post = mongoose.model('Post', postSchema);

module.exports = {
  postSchema,
  Post,
};
