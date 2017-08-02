require('dotenv').config({
  silent: true,
});

if (process.env.NODE_ENV === 'production') {
  console.warn(
    'Seeding the database in production, bruv.. ' +
      "I hope you know what you're doing"
  );
}

(async () => {
  const { connect } = require('../src/db');

  try {
    connect(process.env.MONGODB_URI);
  } catch (e) {
    return console.error('Could not connect to mongo', e);
  }

  const { Book } = require('../src/models');
  const { terms } = require('./seed.json');

  // TODO: bulk import books from gAPI Books
})().then(
  function() {
    require('mongoose').connection.close();
  },
  function(err) {
    console.error('oh noz!', err);
    require('mongoose').connection.close();
  }
);
