/**
 * @swagger
 * /item-category:
 *   post:
 *     summary: Create Item Category
 *     tags: [Item Category]
 *     security:
 *       - userAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoryName
 *             properties:
 *               categoryName:
 *                 type: string
 *                 example: Electronics
 *               description:
 *                 type: string
 *                 example: All electronic related items
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 _id: 65dfab12cd34567890123456
 *                 categoryName: Electronics
 *                 description: All electronic related items
 *                 status: 1
 *       400:
 *         description: Validation error
 *       409:
 *         description: Category already exists
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /item-category:
 *   get:
 *     summary: Get All Item Categories (Based on Customer)
 *     tags: [Item Category]
 *     security:
 *       - userAuth: []
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - _id: 65dfab12cd34567890123456
 *                   categoryName: Electronics
 *                   description: All electronic related items
 *                   status: 1
 *                 - _id: 65dfab12cd34567890123457
 *                   categoryName: Hardware
 *                   description: Hardware tools
 *                   status: 1
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /item-category/{id}:
 *   put:
 *     summary: Update Item Category
 *     tags: [Item Category]
 *     security:
 *       - userAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 65dfab12cd34567890123456
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categoryName:
 *                 type: string
 *                 example: Electronics Updated
 *               description:
 *                 type: string
 *                 example: Updated category description
 *               status:
 *                 type: integer
 *                 description: 1 = ACTIVE, 0 = INACTIVE
 *                 example: 1
 *     responses:
 *       200:
 *         description: Category updated successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 _id: 65dfab12cd34567890123456
 *                 categoryName: Electronics Updated
 *                 description: Updated category description
 *                 status: 1
 *       400:
 *         description: Invalid ID or validation error
 *       404:
 *         description: Category not found
 */

/**
 * @swagger
 * /item-category/{id}:
 *   delete:
 *     summary: Delete Item Category (Soft Delete)
 *     tags: [Item Category]
 *     security:
 *       - userAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 65dfab12cd34567890123456
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 message: Category deleted successfully
 *       404:
 *         description: Category not found
 */
