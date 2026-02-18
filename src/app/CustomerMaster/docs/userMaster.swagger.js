/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User Master Management APIs
 */

/**
 * @swagger
 * /User:
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
 * /User:
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
 * /User/{id}:
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
 * /User/{id}:
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
 * /User/{id}:
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
 * /User/login:
 *   post:
 *     summary: User Login (Supports First Login OTP Verification)
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
 *         description: Login response (Either OTP required or Tokens returned)
 *         content:
 *           application/json:
 *             examples:
 *               FirstLoginOTP:
 *                 summary: First login - OTP sent
 *                 value:
 *                   success: true
 *                   statusCode: 200
 *                   data:
 *                     message: OTP sent to registered email
 *                     isFirstLogin: true
 *               NormalLogin:
 *                 summary: Normal login - Tokens returned
 *                 value:
 *                   success: true
 *                   statusCode: 200
 *                   data:
 *                     accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     redirectUrl: "http://localhost:5173"
 *                     isFirstLogin: false
 *       400:
 *         description: Email and password required
 *       401:
 *         description: Invalid email or password
 *       403:
 *         description: Company not found or inactive
 */

/**
 * @swagger
 * /User/verify-otp:
 *   post:
 *     summary: Verify First Login OTP
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - loginEmail
 *               - otp
 *             properties:
 *               loginEmail:
 *                 type: string
 *                 example: john@company.com
 *               otp:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               statusCode: 200
 *               data:
 *                 accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Invalid request or OTP expired
 *       401:
 *         description: Invalid OTP
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /User/me:
 *   get:
 *     summary: Get logged-in user profile
 *     description: Returns profile details of the currently authenticated user.
 *     tags:
 *       - Users
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
 * /User/resend-otp:
 *   post:
 *     summary: Resend OTP for First Login Verification
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - loginEmail
 *             properties:
 *               loginEmail:
 *                 type: string
 *                 example: john@company.com
 *     responses:
 *       200:
 *         description: OTP resent successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               statusCode: 200
 *               data:
 *                 message: OTP resent successfully
 *       400:
 *         description: OTP not required or invalid request
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               statusCode: 400
 *               data:
 *                 message: OTP not required for this user
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               statusCode: 404
 *               data:
 *                 message: User not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               statusCode: 500
 *               data:
 *                 message: Server error
 */

/**
 * @swagger
 * /User/change-password:
 *   post:
 *     summary: Change Password (Logged-in User)
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
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: OldPass@123
 *               newPassword:
 *                 type: string
 *                 example: NewPass@456
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               statusCode: 200
 *               data:
 *                 message: Password changed successfully
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               statusCode: 400
 *               data:
 *                 message: Current and new password required
 *       401:
 *         description: Current password incorrect
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               statusCode: 401
 *               data:
 *                 message: Current password incorrect
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /User/forgot-password:
 *   post:
 *     summary: Forgot Password (Send Reset OTP to Email)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - loginEmail
 *             properties:
 *               loginEmail:
 *                 type: string
 *                 example: abdur.rahim.amsn@gmail.com
 *     responses:
 *       200:
 *         description: Reset OTP sent successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               statusCode: 200
 *               data:
 *                 message: Reset OTP sent to email
 *       400:
 *         description: Email required
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               statusCode: 400
 *               data:
 *                 message: Email required
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               statusCode: 404
 *               data:
 *                 message: User not found
 *       500:
 *         description: Server error
 */
