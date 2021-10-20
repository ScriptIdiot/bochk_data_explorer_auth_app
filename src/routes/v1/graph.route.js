const express = require('express');
const auth = require('../../middlewares/auth');
const graphController = require('../../controllers/graph.controller');

const router = express.Router();

router.route('/transform-to-csv').post(auth('transformGraphMLToCSV'), graphController.transformGraphMLToCSV);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Graph
 *   description: Graph related requests
 */

/**
 * @swagger
 * /graph/transformToCSV:
 *   post:
 *     summary: Transform the graphML content as a CSV file
 *     description: Logged in users can transform the graphML content as a CSV file
 *     tags: [Graph]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/TransformGraphMLToCSVRequest'
 *       "400":
 *         $ref: '#/components/responses/MissingParameters'
 *       "500":
 *         $ref: '#/components/responses/ServerInternalError'
 */
