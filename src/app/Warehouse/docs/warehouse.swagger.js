/**
 * @swagger
 * /warehouse:
 *   post:
 *     summary: Create Warehouse
 *     tags: [Warehouse]
 *     security:
 *       - userAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - warehouseName
 *               - items
 *             properties:
 *               warehouseName:
 *                 type: string
 *                 example: Chennai Central Warehouse
 *               warehouseLocation:
 *                 type: string
 *                 example: Chennai, Tamil Nadu
 *               items:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - itemMasterId
 *                     - warehouseLimit
 *                     - warehouseReorderLevel
 *                     - warehouseSafeStock
 *                   properties:
 *                     itemMasterId:
 *                       type: string
 *                       example: 65dfab12cd34567890123456
 *                     warehouseLimit:
 *                       type: number
 *                       example: 1000
 *                     warehouseReorderLevel:
 *                       type: number
 *                       example: 200
 *                     warehouseSafeStock:
 *                       type: number
 *                       example: 500
 *     responses:
 *       201:
 *         description: Warehouse created successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               statusCode: 201
 *               data:
 *                 _id: 65dfab12cd34567890123456
 *                 warehouseId: SBWAREHOUSE-001
 *                 warehouseName: Chennai Central Warehouse
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               statusCode: 400
 *               data:
 *                 message: At least one item is required
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /warehouse:
 *   get:
 *     summary: Get Warehouses (Active Only)
 *     tags: [Warehouse]
 *     security:
 *       - userAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         description: Optional Warehouse MongoDB ObjectId
 *         example: 65dfab12cd34567890123456
 *     responses:
 *       200:
 *         description: Warehouse list fetched successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               statusCode: 200
 *               data:
 *                 - _id: 65dfab12cd34567890123456
 *                   warehouseId: SBWAREHOUSE-001
 *                   warehouseName: Chennai Central Warehouse
 *                   warehouseLocation: Chennai, Tamil Nadu
 *                   warehouseMaxLimit: 10000
 *                   safetyStock: 500
 *                   reorderRequired: 200
 *                   supplierName: ABC Suppliers
 *                   lastTransactionQuantity: 300
 *                   lastTransactionDate: 2026-02-18T10:00:00.000Z
 *                   status: 1
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /warehouse/customer:
 *   get:
 *     summary: Get Warehouses for Logged-in Customer (Active Only)
 *     tags: [Warehouse]
 *     security:
 *       - userAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         description: Optional Warehouse MongoDB ObjectId to fetch single warehouse
 *         example: 65dfab12cd34567890123456
 *     responses:
 *       200:
 *         description: Warehouses fetched successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               statusCode: 200
 *               data:
 *                 - _id: 65dfab12cd34567890123456
 *                   warehouseId: SBWAREHOUSE-001
 *                   customerId: 65dabc123456789012345678
 *                   customerName: SmartBin Pvt Ltd
 *                   warehouseName: Chennai Central Warehouse
 *                   warehouseLocation: Chennai, Tamil Nadu
 *                   warehouseMaxLimit: 10000
 *                   safetyStock: 500
 *                   reorderRequired: 200
 *                   supplierName: ABC Suppliers
 *                   lastTransactionQuantity: 300
 *                   lastTransactionDate: 2026-02-18T10:00:00.000Z
 *                   status: 1
 *                   createdAt: 2026-02-18T09:00:00.000Z
 *                   updatedAt: 2026-02-18T09:30:00.000Z
 *       400:
 *         description: Invalid warehouse ID
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               statusCode: 400
 *               data:
 *                 message: Invalid warehouse ID
 *       404:
 *         description: Warehouse not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               statusCode: 404
 *               data:
 *                 message: Warehouse not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /warehouse/{id}:
 *   put:
 *     summary: Update Warehouse (Supports Soft Delete via Status)
 *     tags: [Warehouse]
 *     security:
 *       - userAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Warehouse MongoDB ObjectId
 *         example: 65dfab12cd34567890123456
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               warehouseName:
 *                 type: string
 *                 example: Updated Chennai Warehouse
 *               warehouseLocation:
 *                 type: string
 *                 example: Chennai Industrial Zone
 *               status:
 *                 type: integer
 *                 description: 1 = ACTIVE, 0 = INACTIVE
 *                 example: 1
 *               items:
 *                 type: array
 *                 description: Replace entire warehouse items array
 *                 items:
 *                   type: object
 *                   required:
 *                     - itemMasterId
 *                     - warehouseLimit
 *                     - warehouseReorderLevel
 *                     - warehouseSafeStock
 *                   properties:
 *                     itemMasterId:
 *                       type: string
 *                       example: 65dfab12cd34567890123456
 *                     warehouseLimit:
 *                       type: number
 *                       example: 1500
 *                     warehouseReorderLevel:
 *                       type: number
 *                       example: 300
 *                     warehouseSafeStock:
 *                       type: number
 *                       example: 500
 *     responses:
 *       200:
 *         description: Warehouse updated successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               statusCode: 200
 *               data:
 *                 _id: 65dfab12cd34567890123456
 *                 warehouseId: SBWAREHOUSE-001
 *                 warehouseName: Updated Chennai Warehouse
 *                 status: 1
 *       400:
 *         description: Validation error (Invalid ID, duplicate items, inactive item, etc.)
 *       404:
 *         description: Warehouse not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /warehouse/{id}/item/{itemMasterId}:
 *   delete:
 *     summary: Remove item from warehouse
 *     tags: [Warehouse]
 *     security:
 *       - userAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: itemMasterId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item removed successfully
 *       404:
 *         description: Warehouse or Item not found
 */

/**
 * @swagger
 * /warehouse/{id}:
 *   delete:
 *     summary: Soft delete warehouse
 *     tags: [Warehouse]
 *     security:
 *       - userAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Warehouse deleted successfully
 *       404:
 *         description: Warehouse not found
 */
