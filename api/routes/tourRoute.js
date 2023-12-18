const express = require('express');
const router = express.Router();
const controller = require('../controllers/tourController')
// GET  /
router.get('/', controller.getNewTours);
// GET  /:id
router.get('/:id', controller.getTourById);
module.exports = router;