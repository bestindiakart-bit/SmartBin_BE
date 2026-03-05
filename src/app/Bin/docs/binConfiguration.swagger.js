/**
 * @swagger
 * /bin:
 *   post:
 *     summary: Create Bin Configuration
 *     description: |
 *       Creates a new bin configuration.
 *
 *       - binAllowableWeight must be sent as string like:
 *         "2 kg" or "500 g".
 *       - Backend converts weight to grams.
 *       - binAllowablelimit (quantity) is auto-calculated
 *         based on ItemMaster.weightPerUnit.
 *       - Item must already exist inside the selected warehouse.
 *
 *     tags: [Bin Master]
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
 *               - customerId
 *               - projectId
 *               - masterId
 *               - binId
 *               - binAllowableWeight
 *               - safetyStockQuantity
 *               - rol
 *               - itemPerPrice
 *               - itemMasterId
 *               - warehouseId
 *
 *             properties:
 *
 *               customerId:
 *                 type: string
 *                 example: 65dfab12cd34567890123456
 *
 *               projectId:
 *                 type: string
 *                 example: 65dfab12cd34567890123457
 *
 *               masterId:
 *                 type: string
 *                 example: MASTER-001
 *
 *               binId:
 *                 type: string
 *                 example: BIN-001
 *
 *               binAllowableWeight:
 *                 type: string
 *                 example: 2 kg
 *                 description: Must be in format "2 kg" or "500 g"
 *
 *               customerAllowableLimit:
 *                 type: number
 *                 example: 100
 *
 *               customerAllowableWeight:
 *                 type: number
 *                 example: 2000
 *                 description: Weight in grams
 *
 *               safetyStockQuantity:
 *                 type: number
 *                 example: 10
 *
 *               rol:
 *                 type: number
 *                 example: 15
 *                 description: Reorder Level
 *
 *               itemPerPrice:
 *                 type: number
 *                 example: 5.5
 *
 *               weightPerPrice:
 *                 type: number
 *                 example: 0.02
 *
 *               itemMasterId:
 *                 type: string
 *                 example: 65dfab12cd34567890123499
 *
 *               warehouseId:
 *                 type: string
 *                 example: 65dfab12cd34567890123999
 *                 description: Item must exist inside this warehouse
 *
 *     responses:
 *
 *       201:
 *         description: Bin created successfully
 *
 *       400:
 *         description: |
 *           Validation error:
 *           - Required fields missing
 *           - Invalid ID format
 *           - Invalid weight format
 *           - Item not available in selected warehouse
 *
 *       401:
 *         description: Unauthorized user
 *
 *       404:
 *         description: Project, Item, or Warehouse not found
 *
 *       409:
 *         description: Bin already exists for this project
 *
 *       500:
 *         description: Internal server error
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
 * /bin:
 *   get:
 *     summary: Get all bins (paginated)
 *     tags: [Bin Master]
 *     security:
 *       - userAuth: []
 *     parameters:
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
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: string
 *         description: Filter bins by customer ID
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *         description: Filter bins by project ID
 *       - in: query
 *         name: itemMasterId
 *         schema:
 *           type: string
 *         description: Filter bins by item master ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by binId, masterId, customerItemName, or supplierItemName
 *       - in: query
 *         name: status
 *         schema:
 *           type: integer
 *         description: Status filter (0 = INACTIVE, 1 = ACTIVE)
 *     responses:
 *       200:
 *         description: Bin list retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               statusCode: 200
 *               data:
 *                 total: 25
 *                 totalPages: 3
 *                 currentPage: 1
 *                 limit: 10
 *                 hasNextPage: true
 *                 hasPrevPage: false
 *                 records:
 *                   - _id: 65dfab12cd34567890123456
 *                     binId: BIN-001
 *                     customerId:
 *                       _id: 65dfab12cd34567890123455
 *                       customerName: Customer A
 *                     projectId:
 *                       _id: 65dfab12cd34567890123457
 *                       projectName: Project Alpha
 *                     itemMasterId:
 *                       _id: 65dfab12cd34567890123458
 *                       itemName: Smart Sensor
 *                     customerItemName: Smart Sensor
 *                     supplierItemName: Supplier Sensor
 *                     binMaxWeightFormatted: 2 kg
 *       500:
 *         description: Internal server error
 *
 * /bin/{id}:
 *   get:
 *     summary: Get a single bin by ID
 *     tags: [Bin Master]
 *     security:
 *       - userAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Bin ID to fetch
 *         example: 65dfab12cd34567890123456
 *     responses:
 *       200:
 *         description: Bin retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               statusCode: 200
 *               data:
 *                 record:
 *                   _id: 65dfab12cd34567890123456
 *                   binId: BIN-001
 *                   customerId:
 *                     _id: 65dfab12cd34567890123455
 *                     customerName: Customer A
 *                   projectId:
 *                     _id: 65dfab12cd34567890123457
 *                     projectName: Project Alpha
 *                   itemMasterId:
 *                     _id: 65dfab12cd34567890123458
 *                     itemName: Smart Sensor
 *                   customerItemName: Smart Sensor
 *                   supplierItemName: Supplier Sensor
 *                   binMaxWeightFormatted: 2 kg
 *       400:
 *         description: Invalid ID
 *       403:
 *         description: Forbidden, user cannot access this bin
 *       404:
 *         description: Bin not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /bin/{id}:
 *   put:
 *     summary: Update Bin Configuration (Admin Based - Weight Auto Calculation Supported)
 *     tags: [Bin Master]
 *     security:
 *       - userAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Bin ID
 *         example: 65dfab12cd34567890123456
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *             properties:
 *               customerId:
 *                 type: string
 *                 description: Customer ID (Admin must pass)
 *                 example: 65dfab12cd34567890120001
 *               projectId:
 *                 type: string
 *                 description: Change project (validated by customerId)
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
 *               binMaxWeight:
 *                 type: string
 *                 example: 2 kg
 *               binMaxQuantity:
 *                 type: number
 *                 description: Must match backend calculated quantity
 *                 example: 200
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
 *                 customerId: 65dfab12cd34567890120001
 *                 projectId: 65dfab12cd34567890123499
 *                 binId: BIN-002
 *                 customerItemName: Smart Sensor
 *                 binMaxWeight: 2
 *                 weightUnit: kg
 *                 binMaxQuantity: 200
 *                 status: 1
 *       400:
 *         description: Invalid ID / Validation Error / Quantity Mismatch
 *       404:
 *         description: Bin, Project, or Item not found
 *       409:
 *         description: Duplicate Bin for Project
 */

/**
 * @swagger
 * /bin/items:
 *   get:
 *     summary: Get Items by Customer and Project
 *     description: |
 *       Returns unique items from BinMaster based on:
 *       - customerId
 *       - projectId
 *
 *       Behavior:
 *       - Only ACTIVE bin records are considered.
 *       - If multiple bins contain the same item, duplicates are removed.
 *       - Returns basic item details with bin information.
 *       - Requires authentication.
 *
 *     tags: [BinMaster]
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
 *
 *                       itemName:
 *                         type: string
 *                         example: Steel Frame
 *
 *                       itemCode:
 *                         type: string
 *                         example: ST-01
 *
 *                       customerItemName:
 *                         type: string
 *                         example: Frame Type A
 *
 *                       binId:
 *                         type: string
 *                         example: BIN-01
 *
 *       400:
 *         description: customerId and projectId are required
 *
 *       401:
 *         description: Unauthorized
 *
 *       500:
 *         description: Internal server error
 */
