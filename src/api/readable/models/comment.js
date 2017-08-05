const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  auth: {
    type: String,
    select: false,
    index: true,
  },

  timestamp: {
    type: Date,
    default: Date.now(),
  },

  parentId: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
  },

  body: {
    type: String,
    required: true,
  },

  author: {
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

  parentDeleted: {
    type: Boolean,
    default: false,
    select: false,
  },
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = {
  commentSchema,
  Comment,
};
