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
