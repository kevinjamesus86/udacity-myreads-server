const crypto = require('crypto');
const Identicon = require('identicon.js');
const { Router } = require('express');
const router = (module.exports = new Router());
const validate = require('../middleware/validate');

const cache = new Map();

const hashIt = data => {
  const h = crypto.createHash('sha256');
  h.update(data);
  return h.digest('hex');
};

const generateIdenticon = async hash => {
  const options = {
    format: 'svg',
    foreground: [45, 45, 45, 255], // #2d2d2d
    background: [255, 255, 255, 0], // transparent,
    saturation: 1,
    brightness: 1,
    margin: 0,
    size: 50,
  };
  const identicon = new Identicon(hash, options);
  return identicon.toString(true);
};

/**
 * Get an identicon SVG for some user name
 * @api {get} /identicon/:name
 * @param {string} name - user name to gen an identicon for
 */
router.get(
  '/identicon/:name.svg',
  validate({
    name: {
      in: 'params',
      notEmpty: true,
    },
  }),
  (req, res, next) => {
    const hash = hashIt(req.params.name);

    let identicon = cache.get(hash);
    if (!identicon) {
      identicon = generateIdenticon(hash);
      cache.set(hash, identicon);
    }

    identicon
      .then(svg => {
        res.set('Cache-Control', 'public, max-age=86400');
        res.set('Content-Type', 'image/svg+xml');
        res.send(svg);
      })
      .catch(next);
  }
);
