/**
 * @swagger
 * tags:
 *   name: user-type
 *   description: user-type and permission management APIs
 */

/**
 * @swagger
 * /user-type:
 *   post:
 *     summary: Create a new userType (Role)
 *     tags: [user-type]
 *     security:
 *       - userAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userTypeName
 *               - permissions
 *             properties:
 *               userTypeName:
 *                 type: string
 *                 example: ADMIN
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - module
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
 *                         - warehouse_order_details
 *                         - bin_configuration
 *                         - bill_of_materials
 *                         - forecast_viewer
 *                         - smart_bin_dashboard
 *                         - overall_report
 *                     create:
 *                       type: boolean
 *                     view:
 *                       type: boolean
 *                     edit:
 *                       type: boolean
 *                     delete:
 *                       type: boolean
 *           example:
 *             userTypeName: ADMIN
 *             permissions:
 *               - module: dashboard
 *                 create: true
 *                 view: true
 *                 edit: true
 *                 delete: true
 *               - module: customer_master
 *                 create: true
 *                 view: true
 *                 edit: true
 *                 delete: true
 *               - module: user_master
 *                 create: true
 *                 view: true
 *                 edit: true
 *                 delete: true
 *               - module: project_master
 *                 create: true
 *                 view: true
 *                 edit: true
 *                 delete: true
 *               - module: item_master
 *                 create: true
 *                 view: true
 *                 edit: true
 *                 delete: true
 *               - module: user_type_permission_master
 *                 create: true
 *                 view: true
 *                 edit: true
 *                 delete: true
 *               - module: warehouse_order_details
 *                 create: true
 *                 view: true
 *                 edit: true
 *                 delete: true
 *               - module: bin_configuration
 *                 create: true
 *                 view: true
 *                 edit: true
 *                 delete: true
 *               - module: bill_of_materials
 *                 create: true
 *                 view: true
 *                 edit: true
 *                 delete: true
 *               - module: forecast_viewer
 *                 create: true
 *                 view: true
 *                 edit: true
 *                 delete: true
 *               - module: smart_bin_dashboard
 *                 create: true
 *                 view: true
 *                 edit: true
 *                 delete: true
 *               - module: overall_report
 *                 create: true
 *                 view: true
 *                 edit: true
 *                 delete: true
 *     responses:
 *       201:
 *         description: UserType created successfully
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
 *                     id:
 *                       type: string
 *                       example: 65f2a1e4d2a123456789abcd
 *                     role:
 *                       type: string
 *                       example: ADMIN
 */

/**
 * @swagger
 * /user-type:
 *   get:
 *     summary: Get all user-types
 *     tags: [user-type]
 *     security:
 *       - userAuth: []
 *     responses:
 *       200:
 *         description: Roles fetched successfully
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
 *                       _id:
 *                         type: string
 *                         example: 65f2a1e4d2a123456789abcd
 *                       userTypeName:
 *                         type: string
 *                         example: ADMIN
 */

/**
 * @swagger
 * /user-type/{id}:
 *   get:
 *     summary: Get user-type by ID
 *     tags: [user-type]
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
 *         description: Role fetched successfully
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
 *                     _id:
 *                       type: string
 *                     userTypeName:
 *                       type: string
 *                     permissions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           module:
 *                             type: string
 *                           create:
 *                             type: boolean
 *                           view:
 *                             type: boolean
 *                           edit:
 *                             type: boolean
 *                           delete:
 *                             type: boolean
 */

/**
 * @swagger
 * /user-type/{id}:
 *   put:
 *     summary: Update user-type (Role)
 *     tags: [user-type]
 *     security:
 *       - userAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 65f2a1e4d2a123456789abcd
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userTypeName:
 *                 type: string
 *                 example: SUPERVISOR
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - module
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
 *                         - warehouse_order_details
 *                         - bin_configuration
 *                         - bill_of_materials
 *                         - forecast_viewer
 *                         - smart_bin_dashboard
 *                         - overall_report
 *                     create:
 *                       type: boolean
 *                     view:
 *                       type: boolean
 *                     edit:
 *                       type: boolean
 *                     delete:
 *                       type: boolean
 *           example:
 *             userTypeName: SUPERVISOR
 *             permissions:
 *               - module: dashboard
 *                 create: true
 *                 view: true
 *                 edit: true
 *                 delete: true
 *               - module: customer_master
 *                 create: true
 *                 view: true
 *                 edit: true
 *                 delete: true
 *               - module: user_master
 *                 create: true
 *                 view: true
 *                 edit: true
 *                 delete: true
 *               - module: project_master
 *                 create: true
 *                 view: true
 *                 edit: true
 *                 delete: true
 *               - module: item_master
 *                 create: true
 *                 view: true
 *                 edit: true
 *                 delete: true
 *               - module: user_type_permission_master
 *                 create: true
 *                 view: true
 *                 edit: true
 *                 delete: true
 *               - module: warehouse_order_details
 *                 create: true
 *                 view: true
 *                 edit: true
 *                 delete: true
 *               - module: bin_configuration
 *                 create: true
 *                 view: true
 *                 edit: true
 *                 delete: true
 *               - module: bill_of_materials
 *                 create: true
 *                 view: true
 *                 edit: true
 *                 delete: true
 *               - module: forecast_viewer
 *                 create: true
 *                 view: true
 *                 edit: true
 *                 delete: true
 *               - module: smart_bin_dashboard
 *                 create: true
 *                 view: true
 *                 edit: true
 *                 delete: true
 *               - module: overall_report
 *                 create: true
 *                 view: true
 *                 edit: true
 *                 delete: true
 *     responses:
 *       200:
 *         description: Role updated successfully
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
 */

/**
 * @swagger
 * /user-type/{id}:
 *   delete:
 *     summary: Soft delete user-type
 *     tags: [user-type]
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
 *         description: Role deleted successfully
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
 *                       example: Role deleted successfully
 */
