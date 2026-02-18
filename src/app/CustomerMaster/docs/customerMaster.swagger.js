/**
 * @swagger
 * /customer-master/login:
 *   post:
 *     summary: Login
 *     description: Login with email and password.
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               loginEmail:
 *                 type: string
 *                 example: SmartBin@gmail.com
 *               loginPassword:
 *                 type: string
 *                 example: smartbin@!&^%2025
 *     responses:
 *       200:
 *         description: Master admin profile fetched successfully
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
 *                       example: "65f1b9d22e34a123456789ab"
 *                     loginEmail:
 *                       type: string
 *                       example: masteradmin@smartbin.com
 *                     userTypeId:
 *                       type: object
 *                       properties:
 *                         userTypeName:
 *                           type: string
 *                           example: MASTER_ADMIN
 *
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *
 *       403:
 *         description: Forbidden - Only master admin allowed
 *
 *       404:
 *         description: User not found
 *
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /customer-master/me:
 *   get:
 *     summary: Get logged-in customer master profile
 *     description: Returns profile details of the currently authenticated user.
 *     tags:
 *       - Customer Master
 *
 *     security:
 *       - userAuth: []
 *
 *     responses:
 *       200:
 *         description: Profile fetched successfully
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
 *                       example: "698d661c9afdacfdad0a1bb0"
 *                     userName:
 *                       type: string
 *                       example: "Demo Admin"
 *                     loginEmail:
 *                       type: string
 *                       example: "smartbin@gmail.com"
 *                     companyName:
 *                       type: string
 *                       example: "SmartBin Demo Pvt Ltd"
 *                     url:
 *                       type: string
 *                       example: "smartbin-demo-pvt-ltd"
 *                     status:
 *                       type: number
 *                       example: 1
 *
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Unauthorized request
 *
 *       404:
 *         description: User not found
 *
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /customer-master:
 *   post:
 *     summary: Create a new customer with admin user
 *     tags: [Customers]
 *     security:
 *       - userAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - companyName
 *               - customerName
 *               - customerType
 *               - gstNumber
 *               - adminEmail
 *               - adminPassword
 *               - shippingAddress1
 *               - shippingAddress2
 *               - billingAddress
 *               - geoLocation
 *             properties:
 *               companyName:
 *                 type: string
 *                 example: Smart Bin Pvt Ltd
 *               customerName:
 *                 type: string
 *                 example: Rahim
 *               customerType:
 *                 type: string
 *                 example: Premium
 *               transitDays:
 *                 type: number
 *                 example: 5
 *               gstNumber:
 *                 type: string
 *                 example: 29ABCDE1234F1Z5
 *               adminEmail:
 *                 type: string
 *                 example: admin@smartbin.com
 *               adminPassword:
 *                 type: string
 *                 example: StrongPassword@123
 *               shippingAddress1:
 *                 type: string
 *                 example: Chennai
 *               shippingAddress2:
 *                 type: string
 *                 example: Tamil Nadu
 *               billingAddress:
 *                 type: string
 *                 example: Chennai Billing
 *               geoLocation:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     example: Point
 *                   coordinates:
 *                     type: array
 *                     items:
 *                       type: number
 *                     example: [80.2707, 13.0827]
 *     responses:
 *       201:
 *         description: Customer created successfully
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
 *                     customerId:
 *                       type: string
 *                       example: SBCUSTOMER-002
 *                     companyName:
 *                       type: string
 *                       example: Smart Bin Pvt Ltd
 *                     adminEmail:
 *                       type: string
 *                       example: admin@smartbin.com
 */

/**
 * @swagger
 * /customer-master:
 *   get:
 *     summary: Get all active customers
 *     tags: [Customers]
 *     security:
 *       - userAuth: []
 *     responses:
 *       200:
 *         description: Customers fetched successfully
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
 */

/**
 * @swagger
 * /customer-master/{id}:
 *   get:
 *     summary: Get customer by ID
 *     tags: [Customers]
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
 *         description: Customer fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */

/**
 * @swagger
 * /customer-master/{id}:
 *   put:
 *     summary: Update customer details
 *     tags: [Customers]
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
 *               companyName:
 *                 type: string
 *                 example: Smart Bin Updated
 *               customerName:
 *                 type: string
 *                 example: Rahim Updated
 *               transitDays:
 *                 type: number
 *                 example: 7
 *               shippingAddress1:
 *                 type: string
 *               billingAddress:
 *                 type: string
 *               geoLocation:
 *                 type: object
 *     responses:
 *       200:
 *         description: Customer updated successfully
 */

/**
 * @swagger
 * /customer-master/{id}:
 *   delete:
 *     summary: Soft delete customer and deactivate users
 *     tags: [Customers]
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
 *         description: Customer deactivated successfully
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
 *                       example: Customer deactivated successfully
 */
