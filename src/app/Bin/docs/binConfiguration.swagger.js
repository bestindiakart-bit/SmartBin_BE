/**
 * @swagger
 * /bin:
 *   post:
 *     summary: Create Bin Configuration
 *     tags: [Bin Master]
 *     security:
 *       - userAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projectId
 *               - masterId
 *               - binId
 *               - itemMasterId
 *             properties:
 *               projectId:
 *                 type: string
 *                 example: 65dfab12cd34567890123456
 *               masterId:
 *                 type: string
 *                 example: MASTER-001
 *               binId:
 *                 type: string
 *                 example: BIN-001
 *               supplierItemName:
 *                 type: string
 *                 example: Bosch Sensor
 *               binMaxQuantity:
 *                 type: number
 *                 example: 100
 *               binMaxWeight:
 *                 type: number
 *                 example: 500
 *               safetyStockQuantity:
 *                 type: number
 *                 example: 20
 *               rol:
 *                 type: number
 *                 example: 30
 *               itemPerPrice:
 *                 type: number
 *                 example: 50
 *               weightPerPrice:
 *                 type: number
 *                 example: 5
 *               itemMasterId:
 *                 type: string
 *                 example: 65dfab12cd34567890123499
 *     responses:
 *       201:
 *         description: Bin created successfully
 */

/**
 * @swagger
 * /bin:
 *   get:
 *     summary: Get All Bins or Get Bin By ID
 *     tags: [Bin Master]
 *     security:
 *       - userAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         description: Provide ID to get single bin
 *         example: 65dfab12cd34567890123456
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number (default 1)
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of records per page (default 10)
 *         example: 10
 *     responses:
 *       200:
 *         description: Bin data retrieved successfully
 *         content:
 *           application/json:
 *             examples:
 *               getAll:
 *                 summary: Get All Bins
 *                 value:
 *                   success: true
 *                   statusCode: 200
 *                   data:
 *                     total: 25
 *                     page: 1
 *                     limit: 10
 *                     records:
 *                       - _id: 65dfab12cd34567890123456
 *                         binId: BIN-001
 *                         projectName: Project Alpha
 *                         customerItemName: Smart Sensor
 *               getById:
 *                 summary: Get Bin By ID
 *                 value:
 *                   success: true
 *                   statusCode: 200
 *                   data:
 *                     _id: 65dfab12cd34567890123456
 *                     binId: BIN-001
 *                     projectName: Project Alpha
 *                     customerItemName: Smart Sensor
 *       400:
 *         description: Invalid ID
 *       404:
 *         description: Bin not found
 */

/**
 * @swagger
 * /bin/{id}:
 *   put:
 *     summary: Update Bin Configuration (Supports Project & Item Change + Soft Delete)
 *     tags: [Bin Master]
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
 *               projectId:
 *                 type: string
 *                 description: Change project (auto updates projectName)
 *                 example: 65dfab12cd34567890123499
 *               itemMasterId:
 *                 type: string
 *                 description: Change item (auto updates customerItemName)
 *                 example: 65dfab12cd34567890123999
 *               masterId:
 *                 type: string
 *                 example: MASTER-002
 *               binId:
 *                 type: string
 *                 example: BIN-002
 *               supplierItemName:
 *                 type: string
 *                 example: Bosch Updated
 *               binMaxQuantity:
 *                 type: number
 *                 example: 150
 *               binMaxWeight:
 *                 type: number
 *                 example: 700
 *               safetyStockQuantity:
 *                 type: number
 *                 example: 30
 *               rol:
 *                 type: number
 *                 example: 40
 *               itemPerPrice:
 *                 type: number
 *                 example: 60
 *               weightPerPrice:
 *                 type: number
 *                 example: 6
 *               status:
 *                 type: integer
 *                 description: 1 = ACTIVE, 0 = INACTIVE (Soft Delete)
 *                 example: 0
 *     responses:
 *       200:
 *         description: Bin updated successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               statusCode: 200
 *               data:
 *                 _id: 65dfab12cd34567890123456
 *                 projectName: Project Alpha
 *                 binId: BIN-002
 *                 customerItemName: Smart Sensor
 *                 status: 0
 *       400:
 *         description: Invalid ID or Validation Error
 *       404:
 *         description: Bin not found
 */
