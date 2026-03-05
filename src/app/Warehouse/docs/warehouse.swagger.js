/**
 * @swagger
 * /warehouse:
 *   post:
 *     summary: Create Warehouse (Owner Only)
 *     description: |
 *       Creates a new warehouse.
 *
 *       - Only users with `owner: true` can create warehouse.
 *       - CustomerId is automatically taken from logged-in user.
 *       - At least one item is required.
 *       - Duplicate items in request are not allowed.
 *
 *     tags: [Warehouse]
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
 *               - warehouseName
 *               - items
 *             properties:
 *
 *               warehouseName:
 *                 type: string
 *                 example: Chennai Central Warehouse
 *
 *               warehouseLocation:
 *                 type: string
 *                 example: Chennai, Tamil Nadu
 *
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
 *
 *                     itemMasterId:
 *                       type: string
 *                       example: 65dfab12cd34567890123456
 *
 *                     warehouseLimit:
 *                       type: number
 *                       minimum: 0
 *                       example: 1000
 *
 *                     warehouseReorderLevel:
 *                       type: number
 *                       minimum: 0
 *                       example: 200
 *
 *                     warehouseSafeStock:
 *                       type: number
 *                       minimum: 0
 *                       example: 500
 *
 *                     supplerName:
 *                       type: string
 *                       example: ABC Suppliers
 *
 *                     lastTransationQuantity:
 *                       type: number
 *                       example: 300
 *
 *                     lastTransactionDate:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-02-18T10:00:00.000Z
 *
 *     responses:
 *
 *       201:
 *         description: Warehouse created successfully
 *
 *       403:
 *         description: Only owner users can create warehouse
 *
 *       400:
 *         description: Validation error
 *
 *       404:
 *         description: Item not found
 *
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /warehouse:
 *   get:
 *     summary: Get Warehouses
 *     description: |
 *       - Owner users can view all warehouses.
 *       - Non-owner users can view only their customer warehouses.
 *       - Returns populated customer and item details.
 *
 *     tags: [Warehouse]
 *     security:
 *       - userAuth: []
 *
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         description: Optional Warehouse MongoDB ObjectId
 *
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
 *                   warehouseName: Chennai Central Warehouse
 *                   warehouseLocation: Chennai
 *                   customerId:
 *                     _id: 65dabc123456789012345678
 *                     customerName: SmartBin
 *                   items:
 *                     - itemMasterId:
 *                         _id: 65dfab12cd34567890123456
 *                         itemName: Bolt
 *                         partNumber: BLT-100
 *                         itemDescription: Stainless Bolt
 *                       warehouseLimit: 1000
 *                       warehouseReorderLevel: 200
 *                       warehouseSafeStock: 500
 *                       supplerName: ABC Suppliers
 *                   status: 1
 *
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /warehouse/{id}:
 *   put:
 *     summary: Update Warehouse (Owner Only)
 *     description: |
 *       - Only owner users can update warehouse.
 *       - Can update basic fields and items.
 *       - Existing items are updated.
 *       - New items are added.
 *
 *     tags: [Warehouse]
 *     security:
 *       - userAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *
 *     responses:
 *       200:
 *         description: Warehouse updated successfully
 *
 *       403:
 *         description: Only owner users can update warehouse
 *
 *       404:
 *         description: Warehouse not found
 */

/**
 * @swagger
 * /warehouse/{id}:
 *   delete:
 *     summary: Soft Delete Warehouse
 *     description: |
 *       - Owner users can delete any warehouse.
 *       - Non-owner users can delete only their own customer warehouses.
 *       - Performs soft delete (status = DELETED).
 *
 *     tags: [Warehouse]
 *     security:
 *       - userAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *
 *     responses:
 *       200:
 *         description: Warehouse deleted successfully
 *
 *       404:
 *         description: Warehouse not found or access denied
 *
 *       400:
 *         description: Invalid warehouse ID
 *
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /warehouse/by-item:
 *   get:
 *     summary: Get warehouse by itemMasterId
 *     description: >
 *       Returns warehouseId and warehouseName for a given itemMasterId.
 *       - Owner users can access all customers.
 *       - Normal users can access only their own customer warehouses.
 *
 *     tags: [Warehouse]
 *
 *     security:
 *       - userAuth: []
 *
 *     parameters:
 *       - in: query
 *         name: itemMasterId
 *         required: true
 *         schema:
 *           type: string
 *         example: 65f123abc456def789000111
 *         description: Mongo ObjectId of ItemMaster
 *
 *       - in: query
 *         name: customerId
 *         required: false
 *         schema:
 *           type: string
 *         example: 699fef287b20362d1e29b32a
 *         description: Required only for owner users
 *
 *     responses:
 *       200:
 *         description: Warehouse found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 65fa12bcde3456789000aa11
 *                     warehouseId:
 *                       type: string
 *                       example: WH-001
 *                     warehouseName:
 *                       type: string
 *                       example: Main Warehouse
 *                     customerId:
 *                       type: string
 *                       example: 699fef287b20362d1e29b32a
 *
 *       400:
 *         description: Invalid input
 *
 *       401:
 *         description: Unauthorized
 *
 *       403:
 *         description: Forbidden
 *
 *       404:
 *         description: Warehouse not found
 *
 *       500:
 *         description: Internal server error
 */