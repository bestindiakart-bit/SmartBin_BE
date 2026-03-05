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
 * /customer-master:
 *   post:
 *     summary: Create a new customer with admin user
 *     description: Creates a customer along with an ADMIN user.
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
 *               - transitDays
 *               - gstNumber
 *               - adminEmail
 *               - adminPassword
 *               - position
 *               - department
 *               - shippingAddress1
 *               - shippingAddress2
 *               - billingAddress
 *               - geoLocation
 *             properties:
 *               companyName:
 *                 type: string
 *                 example: Smart Bin Pvt Ltd
 *
 *               customerName:
 *                 type: string
 *                 example: Rahim
 *
 *               customerType:
 *                 type: string
 *                 description: CustomerType ObjectId
 *                 example: 69981f122f12e02c409474bf
 *
 *               transitDays:
 *                 type: number
 *                 minimum: 0
 *                 example: 5
 *
 *               gstNumber:
 *                 type: string
 *                 example: 29ABCDE1234F1Z5
 *
 *               adminEmail:
 *                 type: string
 *                 format: email
 *                 example: admin@smartbin.com
 *
 *               adminPassword:
 *                 type: string
 *                 format: password
 *                 example: StrongPassword@123
 *
 *               mobileNumber:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["9876543210"]
 *
 *               position:
 *                 type: string
 *                 example: Operations Manager
 *
 *               department:
 *                 type: string
 *                 example: Logistics
 *
 *               shippingAddress1:
 *                 type: string
 *                 example: Chennai Warehouse
 *
 *               shippingAddress2:
 *                 type: string
 *                 example: Tamil Nadu
 *
 *               billingAddress:
 *                 type: string
 *                 example: Chennai Billing Office
 *
 *               geoLocation:
 *                 type: object
 *                 required:
 *                   - coordinates
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [Point]
 *                     example: Point
 *                   coordinates:
 *                     type: array
 *                     description: [longitude, latitude]
 *                     items:
 *                       type: number
 *                     example: [80.2707, 13.0827]
 *
 *               isMainAdmin:
 *                 type: boolean
 *                 example: true
 *
 *               owner:
 *                 type: boolean
 *                 example: true
 *
 *               status:
 *                 type: number
 *                 example: 1
 *
 *               permissions:
 *                 type: array
 *                 description: Optional custom permissions for admin user
 *                 items:
 *                   type: object
 *                   properties:
 *                     module:
 *                       type: string
 *                     create:
 *                       type: boolean
 *                     view:
 *                       type: boolean
 *                     edit:
 *                       type: boolean
 *                     delete:
 *                       type: boolean
 *
 *     responses:
 *       201:
 *         description: Customer created successfully
 *
 *       400:
 *         description: Invalid request data
 *
 *       404:
 *         description: Customer type or ADMIN role not found
 *
 *       409:
 *         description: Duplicate GST, Admin email or Mobile number
 *
 *       500:
 *         description: Internal server error
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
 *     summary: Update Customer Type
 *     description: Update customer type details including default module permissions.
 *     tags: [Customers]
 *     security:
 *       - userAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: MongoDB ObjectId of the Customer Type
 *         schema:
 *           type: string
 *           example: 65f2a1e4d2a123456789abcd
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customerTypeName:
 *                 type: string
 *                 description: Name of the customer type
 *                 example: Enterprise Plan
 *
 *               status:
 *                 type: integer
 *                 description: Status of the customer type (1 = ACTIVE, 0 = INACTIVE)
 *                 enum: [0, 1]
 *                 example: 1
 *
 *               permissions:
 *                 type: array
 *                 description: Default module permissions for this customer type
 *                 items:
 *                   type: object
 *                   properties:
 *                     module:
 *                       type: string
 *                       enum:
 *                         - dashboard
 *                         - customer_master
 *                         - user_master
 *                         - project_master
 *                         - item_master
 *                         - user_type_permission_master
 *                         - warehouse_creation
 *                         - warehouse_order_details
 *                         - bin_configuration
 *                         - bill_of_materials
 *                         - forecast_viewer
 *                         - smart_bin_dashboard
 *                         - overall_report
 *
 *                     create:
 *                       type: boolean
 *                       example: true
 *
 *                     view:
 *                       type: boolean
 *                       example: true
 *
 *                     edit:
 *                       type: boolean
 *                       example: true
 *
 *                     delete:
 *                       type: boolean
 *                       example: false
 *
 *                 example:
 *                   - module: dashboard
 *                     create: true
 *                     view: true
 *                     edit: true
 *                     delete: true
 *                   - module: customer_master
 *                     create: true
 *                     view: true
 *                     edit: true
 *                     delete: true
 *                   - module: user_master
 *                     create: true
 *                     view: true
 *                     edit: true
 *                     delete: true
 *                   - module: project_master
 *                     create: true
 *                     view: true
 *                     edit: true
 *                     delete: true
 *                   - module: item_master
 *                     create: true
 *                     view: true
 *                     edit: true
 *                     delete: true
 *                   - module: user_type_permission_master
 *                     create: true
 *                     view: true
 *                     edit: true
 *                     delete: true
 *                   - module: warehouse_creation
 *                     create: true
 *                     view: true
 *                     edit: true
 *                     delete: true
 *                   - module: warehouse_order_details
 *                     create: true
 *                     view: true
 *                     edit: true
 *                     delete: true
 *                   - module: bin_configuration
 *                     create: true
 *                     view: true
 *                     edit: true
 *                     delete: true
 *                   - module: bill_of_materials
 *                     create: true
 *                     view: true
 *                     edit: true
 *                     delete: true
 *                   - module: forecast_viewer
 *                     create: true
 *                     view: true
 *                     edit: true
 *                     delete: true
 *                   - module: smart_bin_dashboard
 *                     create: true
 *                     view: true
 *                     edit: true
 *                     delete: true
 *                   - module: overall_report
 *                     create: true
 *                     view: true
 *                     edit: true
 *                     delete: true
 *
 *     responses:
 *       200:
 *         description: Customer Type updated successfully
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
 *                     customerTypeId:
 *                       type: string
 *                       example: SBCTYPE-002
 *                     customerTypeName:
 *                       type: string
 *                       example: Enterprise Plan
 *                     status:
 *                       type: integer
 *                       example: 1
 *
 *       400:
 *         description: Invalid request data
 *
 *       404:
 *         description: Customer Type not found
 *
 *       409:
 *         description: Duplicate customer type name
 *
 *       500:
 *         description: Internal server error
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
