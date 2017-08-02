exports.limitParallel = (max, arr, fn) => {
  return new Promise((resolve, reject) => {
    if (!(Array.isArray(arr) && arr.length)) return resolve([]);

    const tasks = arr.slice();
    const result = [];
    let running = 0;

    function run() {
      const size = Math.min(max, max - running);
      running += tasks.splice(0, size).map(callback).length;
    }

    function callback(value) {
      return fn(value).then(onFulfilled, onRejected);
    }

    function onFulfilled(ret) {
      if (!running) return;
      running--;
      result.push(ret);
      if (tasks.length) {
        run();
      } else if (!running) {
        resolve(result);
      }
    }

    function onRejected(err) {
      running = 0;
      reject(err);
    }

    run();
  });
};
