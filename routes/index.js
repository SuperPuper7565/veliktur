const express = require('express');

const homeController = require('../controllers/homeController');
const contactController = require('../controllers/contactController');

const router = express.Router();

router.get('/', homeController.renderHome);
router.post('/contact', contactController.submitContactForm);

module.exports = router;

