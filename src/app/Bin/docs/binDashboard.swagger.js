/**
 * @swagger
 * /bin-dashboard/create:
 *   post:
 *     summary: Create or update bin dashboard
 *     tags: [Bin Dashboard]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - masterId
 *               - masterStatus
 *               - binId
 *               - binWeight
 *               - binCurrentQty
 *             properties:
 *               masterId:
 *                 type: string
 *               masterStatus:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *               binId:
 *                 type: string
 *               binWeight:
 *                 type: number
 *               binCurrentQty:
 *                 type: number
 *     responses:
 *       201:
 *         description: Dashboard updated successfully
 *       404:
 *         description: Bin not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /bin-dashboard/dashboard:
 *   get:
 *     summary: Get Bin Dashboard Data
 *     description: Returns bin dashboard data including customer, project, bin configuration and warehouse limits.
 *     tags:
 *       - Bin Dashboard
 *     security:
 *       - userAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data fetched successfully
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
 *                   type: object
 *                   properties:
 *                     records:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           customerName:
 *                             type: string
 *                             example: Sarah Company
 *                           projectName:
 *                             type: string
 *                             example: wareh0001
 *                           masterId:
 *                             type: string
 *                             example: MAS1234
 *                           binId:
 *                             type: string
 *                             example: BINID1234
 *                           itemName:
 *                             type: string
 *                             example: SB GRIP Rivet
 *                           binSafetyLimit:
 *                             type: number
 *                             example: 10
 *                           binReorderLevel:
 *                             type: number
 *                             example: 20
 *                           binMaxLimit:
 *                             type: number
 *                             example: 100
 *                           warehouseSafetyLimit:
 *                             type: number
 *                             example: 50
 *                           warehouseReorderLevel:
 *                             type: number
 *                             example: 80
 *                           warehouseMaxLimit:
 *                             type: number
 *                             example: 200
 *                           warehouseLastUpdatedDate:
 *                             type: string
 *                             format: date-time
 *                             example: 2024-01-11T14:27:00.000Z
 *                           status:
 *                             type: number
 *                             example: 1
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /bin-dashboard/iot/update:
 *   post:
 *     summary: Process IoT Bin Live Data
 *     description: Receives IoT payload, validates bin configuration, updates warehouse stock (if reloaded), and updates live bin status.
 *     tags:
 *       - Bin Dashboard
 *     security:
 *       - userAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - data
 *             properties:
 *               data:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - masterID
 *                     - bins
 *                   properties:
 *                     masterID:
 *                       type: string
 *                       example: XXXXX1234
 *                     masterStatus:
 *                       type: string
 *                       example: Active
 *                     bins:
 *                       type: array
 *                       items:
 *                         type: object
 *                         required:
 *                           - binId
 *                           - weight
 *                           - piecesRemaining
 *                           - time
 *                         properties:
 *                           binId:
 *                             type: string
 *                             example: 1234
 *                           weight:
 *                             type: number
 *                             example: 65
 *                           time:
 *                             type: string
 *                             format: date-time
 *                             example: 2023-10-01T12:00:00Z
 *                           binStatus:
 *                             type: string
 *                             example: Online
 *                           piecesRemaining:
 *                             type: number
 *                             example: 50
 *                           safetyStockLimit:
 *                             type: number
 *                             example: 20
 *                           reorder:
 *                             type: number
 *                             example: 30
 *                           isReloaded:
 *                             type: boolean
 *                             example: true
 *                           reloadaedquantity:
 *                             type: number
 *                             example: 10
 *     responses:
 *       200:
 *         description: IoT data processed successfully
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
 *                       masterId:
 *                         type: string
 *                         example: XXXXX1234
 *                       binId:
 *                         type: string
 *                         example: 1234
 *                       piecesRemaining:
 *                         type: number
 *                         example: 15
 *                       weight:
 *                         type: number
 *                         example: 65
 *                       statusTag:
 *                         type: string
 *                         enum: [green, blue, yellow, orange, red, danger]
 *                         example: yellow
 *                       statusMessage:
 *                         type: string
 *                         example: Reorder Alert - Below Safety Stock
 *                       warehouseCurrentStock:
 *                         type: number
 *                         nullable: true
 *                         example: 120
 *       400:
 *         description: Invalid payload format
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /bin-dashboard/iot/live-status:
 *   get:
 *     summary: Get All Bin Live Status
 *     description: Fetch all bin live status records with optional filtering by masterId, binId, and statusTag.
 *     tags:
 *       - Bin Dashboard
 *     security:
 *       - userAuth: []
 *     parameters:
 *       - in: query
 *         name: masterId
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter by Master ID
 *         example: XXXXX1234
 *       - in: query
 *         name: binId
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter by Bin ID
 *         example: BIN1234
 *       - in: query
 *         name: statusTag
 *         schema:
 *           type: string
 *           enum: [green, blue, yellow, orange, red, danger]
 *         required: false
 *         description: Filter by Status Tag
 *         example: green
 *     responses:
 *       200:
 *         description: Live status fetched successfully
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
 *                 count:
 *                   type: number
 *                   example: 5
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       masterId:
 *                         type: string
 *                         example: XXXXX1234
 *                       binId:
 *                         type: string
 *                         example: BIN1234
 *                       currentQuantity:
 *                         type: number
 *                         example: 50
 *                       currentWeight:
 *                         type: number
 *                         example: 65
 *                       currentStatus:
 *                         type: string
 *                         example: green
 *                       statusTag:
 *                         type: string
 *                         enum: [green, blue, yellow, orange, red, danger]
 *                         example: green
 *                       statusMessage:
 *                         type: string
 *                         example: Normal Stock Level
 *                       warehouseCurrentStock:
 *                         type: number
 *                         nullable: true
 *                         example: 120
 *                       lastUpdatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2024-01-01T10:00:00.000Z
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal Server Error
 */
