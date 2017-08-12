module.exports = item => {
  if ('auth' in item) {
    // Oh mongoose
    item = item.toJSON ? item.toJSON() : item;
    // Undefined doesn't get serialized
    item.auth = undefined;
  }
  return item;
};
