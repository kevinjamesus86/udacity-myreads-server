const { Router } = require('express');
const router = (module.exports = new Router());

router.use(require('./books'));
router.use(require('./shelves'));
