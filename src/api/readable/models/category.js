const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
  auth: {
    type: String,
    select: false,
  },

  name: {
    type: String,
    required: true,
  },

  path: {
    type: String,
    lowercase: true,
  },

  numberOfPosts: {
    type: Number,
    default: 0,
  },
});

categorySchema.index({
  _id: 1,
  auth: 1,
});

const Category = mongoose.model('Category', categorySchema);

module.exports = {
  categorySchema,
  Category,
};
