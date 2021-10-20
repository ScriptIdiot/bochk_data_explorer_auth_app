const express = require('express');
const auth = require('../../middlewares/auth');
const filesController = require('../../controllers/file.controller');

const router = express.Router();

router.route('/:filename').get(auth('downloadFile'), filesController.downloadFile);

module.exports = router;
