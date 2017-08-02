const https = require('https');
const { URL } = require('url');

function prepareOptions(opt) {
  const url = new URL(opt.url);
  if (opt.params) {
    for (const key of Object.keys(opt.params)) {
      url.searchParams.append(key, opt.params[key]);
    }
  }
  return Object.assign(url, opt);
}

exports.get = opt => {
  return new Promise((resolve, reject) => {
    opt = prepareOptions(opt);
    const req = https.get(opt, res => {
      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => (data += chunk));
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
  });
};
