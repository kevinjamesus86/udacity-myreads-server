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
    required: true,
  },

  voteScore: {
    type: Number,
    default: 1,
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
