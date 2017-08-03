const owns = Object.prototype.hasOwnProperty;

exports.options = function scrubOptions(options = {}) {
  const unknownProps = [];

  function rm(prop) {
    delete options[prop];
  }

  function set(prop, value) {
    options[prop] = value;
  }

  for (const prop in options) {
    const value = options[prop];
    if (value == null) {
      rm(prop);
    } else {
      switch (prop) {
        case 'skip':
        case 'limit':
        case 'maxscan':
        case 'batchSize':
          if (+value === +value) set(prop, +value);
          else rm(prop);
          break;
        case 'lean':
        case 'safe':
        case 'overwrite':
          if (typeof value !== 'boolean') rm(prop);
          break;
        default:
          unknownProps.push(prop);
          rm(prop);
      }
    }
  }

  if (unknownProps.length)
    console.warn(
      `Check yo'self: scrub.options ` +
        `removed unknown properties ${unknownProps}`
    );

  return options;
};

exports.query = function scrubQuery(query = {}) {
  if (query)
    for (const prop in query) {
      if (owns.call(query, prop)) {
        const value = query[prop];
        if (value == null) {
          // Bunk value
          delete query[prop];
        } else if (typeof value === 'object') {
          scrubQuery(value);
          // Bunk members -> bunk value
          if (Object.keys(value).length === 0) {
            delete query[prop];
          }
        }
      }
    }
  return query;
};
