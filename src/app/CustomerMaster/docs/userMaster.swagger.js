/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User Master Management APIs
 */

/**
 * @swagger
 * /user-master:
 *   post:
 *     summary: Create a new user (ADMIN only)
 *     tags: [Users]
 *     security:
 *       - userAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userName
 *               - loginEmail
 *               - loginPassword
 *               - userTypeId
 *             properties:
 *               userName:
 *                 type: string
 *                 example: John Doe
 *               loginEmail:
 *                 type: string
 *                 example: john@company.com
 *               loginPassword:
 *                 type: string
 *                 example: StrongPass@123
 *               userTypeId:
 *                 type: string
 *                 example: 65f2a1e4d2a123456789abcd
 *               position:
 *                 type: string
 *                 example: Manager
 *               mobile:
 *                 type: string
 *                 example: 9876543210
 *     responses:
 *       201:
 *         description: User created successfully
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
 *                   example: 201
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       example: SMAR-USER-002
 *                     userName:
 *                       type: string
 *                       example: John Doe
 *                     loginEmail:
 *                       type: string
 *                       example: john@company.com
 */

/**
 * @swagger
 * /user-master:
 *   get:
 *     summary: Get all active users for the logged-in customer
 *     tags: [Users]
 *     security:
 *       - userAuth: []
 *     responses:
 *       200:
 *         description: Users fetched successfully
 */

/**
 * @swagger
 * /user-master/{id}:
 *   get:
 *     summary: Get single user by ID
 *     tags: [Users]
 *     security:
 *       - userAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 65f2a1e4d2a123456789abcd
 *     responses:
 *       200:
 *         description: User fetched successfully
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /user-master/{id}:
 *   put:
 *     summary: Update user details
 *     tags: [Users]
 *     security:
 *       - userAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userName:
 *                 type: string
 *                 example: Updated Name
 *               loginEmail:
 *                 type: string
 *                 example: updated@company.com
 *               userTypeId:
 *                 type: string
 *                 example: 65f2a1e4d2a123456789abcd
 *               position:
 *                 type: string
 *                 example: Senior Manager
 *               mobile:
 *                 type: string
 *                 example: 9999999999
 *     responses:
 *       200:
 *         description: User updated successfully
 *       409:
 *         description: Email already exists
 */

/**
 * @swagger
 * /user-master/{id}:
 *   delete:
 *     summary: Soft delete user (Deactivate)
 *     tags: [Users]
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
 *         description: User deactivated successfully
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
 *                     message:
 *                       type: string
 *                       example: User deactivated successfully
 */

/**
 * @swagger
 * /user-master/login:
 *   post:
 *     summary: User Login
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - loginEmail
 *               - loginPassword
 *             properties:
 *               loginEmail:
 *                 type: string
 *                 example: john@company.com
 *               loginPassword:
 *                 type: string
 *                 example: StrongPass@123
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Bad request
 *       401:
 *         description: Invalid credentials
 */
