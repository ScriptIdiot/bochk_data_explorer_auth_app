const express = require('express');
const filesController = require('../../controllers/file.controller');

const router = express.Router();

router.route('/:filename').get(filesController.downloadFile);

module.exports = router;
