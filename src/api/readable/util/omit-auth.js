module.exports = item => {
  if ('auth' in item) {
    // hide it
    Object.defineProperty(item, 'auth', {
      enumerable: false,
      value: item.auth,
    });
  }
  return item;
};
