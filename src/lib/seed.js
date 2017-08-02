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
  const { connect } = require('../../src/db');

  try {
    connect(process.env.MONGODB_URI);
  } catch (e) {
    return console.error('Could not connect to mongo', e);
  }

  const argTerms = process.argv.slice(2).map(s => s.trim()).filter(Boolean);
  const terms = argTerms.length ? argTerms : require('./terms.json');

  const { fetchBooks } = require('./runner');
  const { limitParallel } = require('./util/limit-parallel');

  // NOTE: This takes a couple minutes
  const importedTerms = await limitParallel(2, terms, term =>
    fetchBooks({ term }).then(count => ({
      term,
      count,
    }))
  );

  console.log(`Imported: `, importedTerms);
})().then(
  () => {
    require('mongoose').connection.close();
  },
  err => {
    console.error('Oh snap, something when wrong: ', err);
    require('mongoose').connection.close();
  }
);
