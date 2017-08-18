const { assign } = Object;
const { Category, Post, Comment } = require('../models');

const initializedAuths = new Map();

const authAdder = auth => to => (auth ? assign({ auth }, to) : assign({}, to));

const initCategories = [
  {
    name: 'react',
    path: 'react',
    numberOfPosts: 1,
    __v: 0,
  },
  {
    name: 'redux',
    path: 'redux',
    numberOfPosts: 1,
    __v: 0,
  },
  {
    name: 'udacity',
    path: 'udacity',
    __v: 0,
  },
];

const initPosts = [
  {
    timestamp: 1467166872634,
    title: 'Udacity is the best place to learn React',
    body:
      'Tempor health goth next level, everyday carry vape offal nisi lumbersexual PBR&B 3 wolf moon four loko yuccie ex put a bird on it. Tumblr gochujang snackwave hot chicken pop-up. Narwhal in meditation selvage jean shorts PBR&B elit mustache art party sed shaman meh roof party. VHS echo park cupidatat quinoa. In actually kombucha marfa cray. Whatever letterpress irure elit.',
    author: 'Jason',
    voteScore: 5,
    numberOfComments: 1,
    __v: 0,
  },
  {
    timestamp: 1468479767190,
    title: 'Learn Redux in 10 minutes!',
    body:
      'Hell of irure ea do stumptown gluten-free. Organic kombucha master cleanse cillum, live-edge reprehenderit voluptate chillwave microdosing DIY consectetur. Snackwave forage raclette wolf, skateboard nulla occaecat sed reprehenderit DIY authentic truffaut.',
    author: 'Stewie',
    voteScore: 2,
    numberOfComments: 1,
    __v: 0,
  },
];

const initComments = [
  {
    timestamp: 1468166872634,
    body:
      'Tattooed single-origin coffee lo-fi keytar poutine. Mollit viral magna raclette, sed est ut gluten-free labore in hot chicken retro. Hell of pickled enamel pin, four dollar toast id meditation bespoke minim drinking vinegar. Ut yuccie glossier, kogi aesthetic whatever small batch affogato duis seitan kinfolk est.',
    voteScore: 6,
    __v: 0,
  },
  {
    timestamp: 1469479767190,
    body:
      'Literally food truck velit semiotics lomo, non street art cloud bread laboris blog air plant franzen shabby chic narwhal eu. Ennui franzen ad, lorem scenester authentic pok pok kinfolk.',
    voteScore: 3,
    __v: 0,
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
  console.log(`Readable: seeding Auth<${auth}>`);
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
      assign(maybeAddAuth(post), {
        categoryId: categories[index]._id,
        category: categories[index].path,
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

  const comments = initComments.map((comment, index) => {
    const { author, _id: parentId } = posts[index];
    return new Comment(
      assign(maybeAddAuth(comment), {
        parentId,
        author,
      })
    ).toJSON();
  });

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
