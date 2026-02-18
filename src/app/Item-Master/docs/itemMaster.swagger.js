/**
 * @swagger
 * /item-master:
 *   post:
 *     summary: Create Item Master (With Images)
 *     tags: [Item Master]
 *     security:
 *       - userAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - itemName
 *             properties:
 *               itemImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               itemName:
 *                 type: string
 *                 example: Smart Sensor
 *               itemCategory:
 *                 type: string
 *                 example: 65dfab12cd34567890123412
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
 *     summary: Update Item (Add Images Supported)
 *     tags: [Item Master]
 *     security:
 *       - userAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Item MongoDB ObjectId
 *         example: 65dfab12cd34567890123456
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               itemName:
 *                 type: string
 *                 example: Smart Dustbin 20L
 *               itemCategory:
 *                 type: string
 *                 example: 65dabc987654321098765432
 *               partNumber:
 *                 type: string
 *                 example: SD-20L-2026
 *               itemDescription:
 *                 type: string
 *                 example: Automatic sensor-based dustbin with 20 litre capacity
 *               weightPerUnit:
 *                 type: number
 *                 example: 3.5
 *               costPerUnit:
 *                 type: number
 *                 example: 850
 *               remarks:
 *                 type: string
 *                 example: Updated design with improved lid motor
 *               manufacturingTime:
 *                 type: number
 *                 example: 5
 *               itemSBQ:
 *                 type: number
 *                 example: 10
 *               price:
 *                 type: number
 *                 example: 1299
 *               itemHSNCode:
 *                 type: string
 *                 example: 39249090
 *               warehouseStock:
 *                 type: number
 *                 example: 150
 *               warehouseSafetyStock:
 *                 type: number
 *                 example: 25
 *               warehouseStockUrl:
 *                 type: string
 *                 example: https://smartbin-storage.s3.amazonaws.com/warehouse-stock.pdf
 *               isLocal:
 *                 type: boolean
 *                 example: true
 *               status:
 *                 type: integer
 *                 description: 1 = ACTIVE, 0 = INACTIVE
 *                 example: 1
 *               itemImages:
 *                 type: array
 *                 description: Upload new images (existing images will be retained)
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Item updated successfully
 *       400:
 *         description: Bad request
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

/**
 * @swagger
 * /item-master/{id}/images:
 *   delete:
 *     summary: Delete selected images from Item
 *     tags: [Item Master]
 *     security:
 *       - userAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Item MongoDB ObjectId
 *         example: 65dfab12cd34567890123456
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - images
 *             properties:
 *               images:
 *                 type: array
 *                 description: Array of image URLs to delete
 *                 items:
 *                   type: string
 *                 example:
 *                   - https://smartbin-storage.s3.amazonaws.com/items/img1.jpg
 *                   - https://smartbin-storage.s3.amazonaws.com/items/img2.jpg
 *     responses:
 *       200:
 *         description: Images deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               statusCode: 200
 *               data:
 *                 _id: 65dfab12cd34567890123456
 *                 itemId: SBITEM-004
 *                 itemImages:
 *                   - https://smartbin-storage.s3.amazonaws.com/items/img3.jpg
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Item not found
 */

/**
 * @swagger
 * /item-master:
 *   get:
 *     summary: Get All Item Masters (With Pagination & Filters)
 *     tags: [Item Master]
 *     security:
 *       - userAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of records per page
 *         example: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by itemName or partNumber
 *         example: Smart
 *       - in: query
 *         name: itemCategory
 *         schema:
 *           type: string
 *         description: Filter by Item Category ID
 *         example: 65dabc987654321098765432
 *       - in: query
 *         name: status
 *         schema:
 *           type: integer
 *         description: 1 = ACTIVE, 0 = INACTIVE
 *         example: 1
 *     responses:
 *       200:
 *         description: Item list fetched successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               statusCode: 200
 *               data:
 *                 totalRecords: 25
 *                 totalPages: 3
 *                 currentPage: 1
 *                 items:
 *                   - _id: 65dfab12cd34567890123456
 *                     itemId: SBITEM-001
 *                     itemName: Smart Sensor
 *                     partNumber: SS-1001
 *                     price: 750
 *                     warehouseStock: 100
 *                     status: 1
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
