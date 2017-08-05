const { Router } = require('express');
const router = (module.exports = new Router());

router.use('/myreads', require('./books'), require('./shelves'));
