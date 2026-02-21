/**
 * @swagger
 * /customer-type:
 *   post:
 *     summary: Create Customer Type
 *     tags: [Customer Type Master]
 *     security:
 *       - userAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerTypeName
 *             properties:
 *               customerTypeName:
 *                 type: string
 *                 example: Car Manufacturing
 *     responses:
 *       201:
 *         description: Created
 *       409:
 *         description: Already exists
 */

/**
 * @swagger
 * /customer-type:
 *   get:
 *     summary: Get Customer Types
 *     tags: [Customer Type Master]
 *     security:
 *       - userAuth: []
 *     responses:
 *       200:
 *         description: List retrieved
 */

/**
 * @swagger
 * /customer-type/{id}:
 *   put:
 *     summary: Update Customer Type
 *     tags: [Customer Type Master]
 *     security:
 *       - userAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customerTypeName:
 *                 type: string
 *                 example: IT Services
 *               status:
 *                 type: integer
 *                 example: 1
 */
