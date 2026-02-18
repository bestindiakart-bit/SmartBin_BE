/**
 * @swagger
 * /item-master:
 *   post:
 *     summary: Create Item Master
 *     tags: [Item Master]
 *     security:
 *       - userAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - itemName
 *             properties:
 *               itemName:
 *                 type: string
 *                 example: Smart Sensor
 *               partNumber:
 *                 type: string
 *                 example: SS-1001
 *               itemDescription:
 *                 type: string
 *                 example: IoT Smart Waste Sensor
 *               weightPerUnit:
 *                 type: number
 *                 example: 1.25
 *               costPerUnit:
 *                 type: number
 *                 example: 500
 *               remarks:
 *                 type: string
 *                 example: Imported from Germany
 *               manufacturingTime:
 *                 type: number
 *                 example: 48
 *               productCategory:
 *                 type: string
 *                 example: 65dfab12cd34567890123411
 *               itemCategory:
 *                 type: string
 *                 example: 65dfab12cd34567890123412
 *               itemSBQ:
 *                 type: number
 *                 example: 10
 *               price:
 *                 type: number
 *                 example: 750
 *               itemHSNCode:
 *                 type: string
 *                 example: 84799090
 *               warehouseStock:
 *                 type: number
 *                 example: 100
 *               warehouseSafetyStock:
 *                 type: number
 *                 example: 20
 *               warehouseStockUrl:
 *                 type: string
 *                 example: https://warehouse.smartbin.com/stock/ss-1001
 *               isLocal:
 *                 type: boolean
 *                 example: true
 *               status:
 *                 type: integer
 *                 description: 1 = ACTIVE, 0 = INACTIVE
 *                 example: 1
 *     responses:
 *       201:
 *         description: Item created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /item-master/{id}:
 *   get:
 *     summary: Get Item By ID
 *     tags: [Item Master]
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
 *         description: Item details
 *       400:
 *         description: Invalid ID
 *       404:
 *         description: Item not found
 */

/**
 * @swagger
 * /item-master/{id}:
 *   put:
 *     summary: Update Item
 *     tags: [Item Master]
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
 *               itemName:
 *                 type: string
 *                 example: Smart Sensor Updated
 *               price:
 *                 type: number
 *                 example: 800
 *               warehouseStock:
 *                 type: number
 *                 example: 120
 *               status:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Item updated successfully
 *       404:
 *         description: Item not found
 */

/**
 * @swagger
 * /item-master/{id}:
 *   delete:
 *     summary: Delete Item (Soft Delete)
 *     tags: [Item Master]
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
 *         description: Item deleted successfully
 *       404:
 *         description: Item not found
 */
