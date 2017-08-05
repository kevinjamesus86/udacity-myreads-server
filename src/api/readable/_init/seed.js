const { assign } = Object;
const { Category, Post, Comment } = require('../models');

const initializedAuths = new Map();

const sampleOne = arr => arr[Math.floor(Math.random() * arr.length)];

const authAdder = auth => to => (auth ? assign({ auth }, to) : assign({}, to));

const initCategories = [
  {
    name: 'react',
    path: 'react',
    numberOfPosts: 1,
  },
  {
    name: 'redux',
    path: 'redux',
    numberOfPosts: 1,
  },
  {
    name: 'udacity',
    path: 'udacity',
  },
];

const initPosts = [
  {
    timestamp: 1467166872634,
    title: 'Udacity is the best place to learn React',
    body: 'Everyone says so after all.',
    author: 'thingtwo',
    voteScore: 6,
  },
  {
    timestamp: 1468479767190,
    title: 'Learn Redux in 10 minutes!',
    body: 'Just kidding. It takes more than 10 minutes to learn technology.',
    author: 'thingone',
    voteScore: -5,
  },
];

const initComments = [
  {
    timestamp: 1468166872634,
    body: 'Hi there! I am a COMMENT.',
    author: 'thingtwo',
    voteScore: 6,
  },
  {
    timestamp: 1469479767190,
    body: 'Comments. Are. Cool.',
    author: 'thingone',
    voteScore: -5,
  },
];

module.exports = (req, res, next) => {
  const { auth } = res.locals;

  let initPromise = initializedAuths.get(auth);
  if (initPromise) {
    return initPromise.then(next, next);
  }

  initPromise = Category.findOne(
    {
      auth: auth || {
        $exists: false,
      },
    },
    `_id`,
    { lean: true }
  ).then(doc => (doc && doc._id ? Promise.resolve() : dropItLikeItsHot(auth)));

  initPromise.then(next, next);

  // Don't do this work over again
  initializedAuths.set(auth, initPromise);
};

const dropItLikeItsHot = async auth => {
  const maybeAddAuth = authAdder(auth);

  /////////////////
  // Categories
  /////////////////

  const categories = initCategories.map(cat =>
    new Category(maybeAddAuth(cat)).toJSON()
  );

  await Category.bulkWrite(
    categories.map(cat => ({
      updateOne: {
        filter: maybeAddAuth({ _id: cat._id }),
        update: cat,
        upsert: true,
      },
    }))
  );

  /////////////////
  // Posts
  /////////////////

  const posts = initPosts.map((post, index) =>
    new Post(
      assign({}, maybeAddAuth(post), {
        categoryId: categories[index]._id,
      })
    ).toJSON()
  );

  await Post.bulkWrite(
    posts.map(post => ({
      updateOne: {
        filter: maybeAddAuth({ _id: post._id }),
        update: post,
        upsert: true,
      },
    }))
  );

  /////////////////
  // Comments
  /////////////////

  const comments = initComments.map(comment =>
    new Comment(
      assign({}, maybeAddAuth(comment), {
        parentId: sampleOne(posts)._id,
      })
    ).toJSON()
  );

  await Comment.bulkWrite(
    comments.map(comment => ({
      updateOne: {
        filter: maybeAddAuth({ _id: comment._id }),
        update: comment,
        upsert: true,
      },
    }))
  );
};
