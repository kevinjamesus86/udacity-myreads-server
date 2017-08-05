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
  const { connect } = require('../../../db');

  // If we can't connect to the database then
  // we don't need to do any of the work that follows
  try {
    await connect(process.env.MONGODB_URI);
  } catch (e) {
    return console.error('Could not connect to mongo', e);
  }

  const argTerms = process.argv.slice(2).map(s => s.trim()).filter(Boolean);
  const terms = argTerms.length ? argTerms : require('./terms.json');

  const { fetchBooks } = require('./runner');

  // NOTE: This _may_ take a couple minutes
  let importedTerms = [];
  for (const term of terms) {
    importedTerms.push(
      await fetchBooks({ term }).then(count => ({
        term,
        count,
      }))
    );
  }

  console.log(`Imported:\n`, importedTerms);
})().then(
  () => {
    require('mongoose').connection.close();
  },
  err => {
    console.error('Oh snap, something when wrong: ', err);
    require('mongoose').connection.close();
  }
);
