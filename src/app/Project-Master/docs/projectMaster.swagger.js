/**
 * @swagger
 * /project:
 *   post:
 *     summary: Create Project
 *     tags: [Project Master]
 *     security:
 *       - userAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projectName
 *               - projectHead
 *               - projectManager
 *               - startDate
 *             properties:
 *               projectName:
 *                 type: string
 *                 example: Smart Waste Monitoring
 *               projectHead:
 *                 type: string
 *                 description: User ObjectId of Project Head
 *                 example: 698f1acfb9402a8e32e9474f
 *               projectManager:
 *                 type: string
 *                 description: User ObjectId of Project Manager
 *                 example: 698f1acfb9402a8e32e9474e
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: 2026-02-01
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: 2026-06-01
 *               projectDescription:
 *                 type: string
 *                 example: IoT Smart Bin Deployment across Chennai
 *     responses:
 *       201:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     projectId:
 *                       type: string
 *                       example: 65dfab12cd34567890123456
 *                     projectName:
 *                       type: string
 *                       example: Smart Waste Monitoring
 *       400:
 *         description: Validation error
 *       403:
 *         description: Permission denied
 */

/**
 * @swagger
 * /project:
 *   get:
 *     summary: Get Projects (Paginated)
 *     tags: [Project Master]
 *     security:
 *       - userAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         example: 10
 *     responses:
 *       200:
 *         description: List of projects
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 25
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     projects:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           projectName:
 *                             type: string
 *                           projectHead:
 *                             type: string
 *                           projectManager:
 *                             type: string
 *                           startDate:
 *                             type: string
 *                           endDate:
 *                             type: string
 *                           projectDescription:
 *                             type: string
 *                           manualEntry:
 *                             type: boolean
 *                           status:
 *                             type: integer
 */

/**
 * @swagger
 * /project/{id}:
 *   put:
 *     summary: Update Project
 *     tags: [Project Master]
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
 *               projectName:
 *                 type: string
 *                 example: Smart Waste Monitoring Phase 2
 *               projectHead:
 *                 type: string
 *                 description: User ObjectId of Project Head
 *                 example: 698f1acfb9402a8e32e9474f
 *               projectManager:
 *                 type: string
 *                 description: User ObjectId of Project Manager
 *                 example: 698f1acfb9402a8e32e9474e
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: 2026-03-01
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: 2026-08-01
 *               projectDescription:
 *                 type: string
 *                 example: Expanded IoT Smart Bin deployment across Tamil Nadu
 *               manualEntry:
 *                 type: boolean
 *                 example: false
 *               status:
 *                 type: integer
 *                 description: Project status number (1 = ACTIVE, 0 = INACTIVE)
 *                 example: 1
 *     responses:
 *       200:
 *         description: Project updated successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 _id: 65dfab12cd34567890123456
 *                 projectId: SBPROJECT-007
 *                 projectName: Smart Waste Monitoring Phase 2
 *                 projectHead: Pokemon
 *                 projectManager: Ash
 *                 startDate: 2026-03-01T00:00:00.000Z
 *                 endDate: 2026-08-01T00:00:00.000Z
 *                 projectDescription: Expanded IoT Smart Bin deployment across Tamil Nadu
 *                 manualEntry: false
 *                 status: 1
 *       400:
 *         description: Validation error
 *       404:
 *         description: Project not found
 */

/**
 * @swagger
 * /project/{id}:
 *   delete:
 *     summary: Delete Project
 *     tags: [Project Master]
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
 *         description: Project deleted successfully
 *       404:
 *         description: Project not found
 */

/**
 * @swagger
 * /project/{id}:
 *   get:
 *     summary: Get Project By ID
 *     tags: [Project Master]
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
 *         description: Project details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     projectId:
 *                       type: string
 *                       example: SBPROJECT-005
 *                     projectName:
 *                       type: string
 *                     projectHead:
 *                       type: string
 *                     projectManager:
 *                       type: string
 *                     startDate:
 *                       type: string
 *                     endDate:
 *                       type: string
 *                     projectDescription:
 *                       type: string
 *                     manualEntry:
 *                       type: boolean
 *                     status:
 *                       type: integer
 *                     createdBy:
 *                       type: string
 *                     updatedBy:
 *                       type: string
 *       400:
 *         description: Invalid ID format
 *       404:
 *         description: Project not found
 */
