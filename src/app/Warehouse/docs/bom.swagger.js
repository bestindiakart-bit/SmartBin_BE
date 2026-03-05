/**
 * @swagger
 * /bom:
 *   post:
 *     summary: Create BOM (Owner Only)
 *     description: |
 *       Creates a new Bill of Material (BOM).
 *
 *       - Only users with `owner: true` can create BOM.
 *       - CustomerId is automatically taken from logged-in user (if not super owner).
 *       - At least one item is required.
 *       - Duplicate items inside BOM are not allowed.
 *
 *     tags: [BOM]
 *     security:
 *       - userAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bomName
 *               - projectId
 *               - overallQuantity
 *               - items
 *             properties:
 *
 *               bomName:
 *                 type: string
 *                 example: Smart Bin Assembly
 *
 *               projectId:
 *                 type: string
 *                 example: 65dfab12cd34567890123456
 *
 *               overallQuantity:
 *                 type: number
 *                 minimum: 1
 *                 example: 50
 *
 *               items:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - itemId
 *                     - quantity
 *                   properties:
 *
 *                     itemId:
 *                       type: string
 *                       example: 65dfab12cd34567890123456
 *
 *                     quantity:
 *                       type: number
 *                       minimum: 1
 *                       example: 5
 *
 *     responses:
 *
 *       201:
 *         description: BOM created successfully
 *
 *       403:
 *         description: Only owner users can create BOM
 *
 *       400:
 *         description: Validation error
 *
 *       404:
 *         description: Item or Project not found
 *
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /bom:
 *   get:
 *     summary: Get All BOMs
 *     description: |
 *       Returns list of BOMs.
 *
 *       - Owner users can view all BOMs.
 *       - Normal users can view only their customer BOMs.
 *       - Supports pagination and project filter.
 *
 *     tags: [BOM]
 *     security:
 *       - userAuth: []
 *
 *     parameters:
 *
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *         example: 1
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *         example: 10
 *
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *         example: 65dfab12cd34567890123456
 *
 *     responses:
 *
 *       200:
 *         description: BOM list fetched successfully
 *
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /bom/{id}:
 *   get:
 *     summary: Get Single BOM
 *     description: Returns detailed BOM with populated items and project.
 *
 *     tags: [BOM]
 *     security:
 *       - userAuth: []
 *
 *     parameters:
 *
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 65dfab12cd34567890123456
 *
 *     responses:
 *
 *       200:
 *         description: BOM fetched successfully
 *
 *       404:
 *         description: BOM not found
 *
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /bom/{id}:
 *   put:
 *     summary: Update BOM
 *     description: |
 *       Updates BOM details.
 *
 *       - Only owner users can update BOM.
 *       - Items array can be modified.
 *
 *     tags: [BOM]
 *     security:
 *       - userAuth: []
 *
 *     parameters:
 *
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *
 *     responses:
 *
 *       200:
 *         description: BOM updated successfully
 *
 *       404:
 *         description: BOM not found
 *
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /bom/{id}:
 *   delete:
 *     summary: Delete BOM (Soft Delete)
 *     description: Marks BOM as deleted.
 *
 *     tags: [BOM]
 *     security:
 *       - userAuth: []
 *
 *     parameters:
 *
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *
 *     responses:
 *
 *       200:
 *         description: BOM deleted successfully
 *
 *       404:
 *         description: BOM not found
 *
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /bom/items:
 *   get:
 *     summary: Get Items by Customer and Project
 *     description: |
 *       Returns unique items used in BOMs filtered by:
 *       - Customer
 *       - Project
 *
 *       Behavior:
 *       - Only active BOM records are considered.
 *       - Returns unique items (duplicates removed).
 *       - Requires authentication.
 *
 *     tags: [BOM]
 *     security:
 *       - userAuth: []
 *
 *     parameters:
 *
 *       - in: query
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *         example: 65dfab12cd34567890123456
 *
 *       - in: query
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         example: 65dfab12cd34567890129999
 *
 *     responses:
 *
 *       200:
 *         description: Items fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 statusCode:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 65dfab12cd34567890120001
 *                       itemName:
 *                         type: string
 *                         example: Steel Frame
 *                       itemCode:
 *                         type: string
 *                         example: ST-01
 *
 *       400:
 *         description: customerId and projectId are required
 *
 *       401:
 *         description: Unauthorized
 */
