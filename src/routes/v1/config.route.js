const express = require('express');
const auth = require('../../middlewares/auth');
const configController = require('../../controllers/config.controller');

const router = express.Router();

router.route('/neo4j-connections').get(auth('getNeo4jConnections'), configController.getNeo4jConnections);
router.route('/cyber-sample-queries').get(auth('getCyberSampleQueries'), configController.getCyberSampleQueries);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Config
 *   description: Config retrieval
 */

/**
 * @swagger
 * /config/neo4j-connections:
 *   get:
 *     summary: Get Neo4j connection configurations
 *     description: Logged in users can fetch Neo4j connection configurations
 *     tags: [Config]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Neo4jConfig'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /config/cyber-sample-queries:
 *   get:
 *     summary: Get Cyber Sample Queries for Data Explorer
 *     description: Logged in users can fetch cyber sample queries
 *     tags: [Config]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/CyberSampleQuery'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
