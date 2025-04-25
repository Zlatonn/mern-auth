import bcrypt, { compare } from "bcryptjs"
import jwt from "jsonwebtoken"
import userModel from "../models/userModel.js"
import transporter from "../config/nodemailer.js"
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE } from "../config/emailTemplate.js"

// Register user
export const register = async (req, res) => {
	const { name, email, password } = req.body

	// Check missing details
	if (!name || !email || !password) {
		return res.json({ success: false, message: "Missing details" })
	}

	try {
		// Check user already email
		const existingUser = await userModel.findOne({ email })

		if (existingUser) {
			return res.json({ success: false, message: "User already exists" })
		}

		// Encrypt password
		const hashedPassword = await bcrypt.hash(password, 10)

		// Add user to DB
		const user = new userModel({ name, email, password: hashedPassword })
		await user.save()

		// Generate jwt token
		const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" })

		// Add token in cookie
		res.cookie("token", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
			maxAge: 7 * 24 * 60 * 60 * 1000,
		})

		// Sending welcome email
		const mailOptions = {
			from: process.env.SENDER_EMAIL,
			to: email,
			subject: "Welcome to Zlatonn",
			text: `Welcome to zlatonn website. Your account has been created with email id: ${email}`,
		}

		await transporter.sendMail(mailOptions)

		res.json({ success: true, message: "Registered" })
	} catch (error) {
		res.json({ success: false, message: error.message })
	}
}

// Log in
export const login = async (req, res) => {
	const { email, password } = req.body

	// Check field required
	if (!email || !password) {
		return res.json({ success: false, message: "Email and Password are required" })
	}

	try {
		const user = await userModel.findOne({ email })

		//  Check invalid email
		if (!user) {
			return res.json({ success: false, message: "Invalid email" })
		}

		const isMatch = await bcrypt.compare(password, user.password)

		// Check invaild password
		if (!isMatch) {
			return res.json({ success: false, message: "Invalid password" })
		}

		// Generate jwt token
		const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" })

		// Add token in cookie
		res.cookie("token", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
			maxAge: 7 * 24 * 60 * 60 * 1000,
		})

		res.json({ success: true, message: "Logged in" })
	} catch (error) {
		res.json({ success: false, message: error.message })
	}
}

// Log out
export const logout = async (req, res) => {
	try {
		// Clear cookie
		res.clearCookie("token", {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
		})

		res.json({ success: true, message: "Logged out" })
	} catch (error) {
		res.json({ success: false, message: "Invalid password" })
	}
}

// Send Verification OTP to ther User's Email
export const sendVerifyOtp = async (req, res) => {
	try {
		const { userId } = req.body

		const user = await userModel.findById(userId)

		// Check user not found
		if (!user) {
			return res.json({ success: false, message: "User not found" })
		}

		// Check account already verified
		if (user.isAccountVerified) {
			return res.json({ success: false, message: "Account already verified" })
		}

		// Generate Otp
		const otp = String(Math.floor(100000 + Math.random() * 900000))

		// Set OTP & OTP Expire time
		user.verifyOtp = otp
		user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000

		// Save to DB
		await user.save()

		// Set mail option for verify account with OTP
		const mailOption = {
			from: process.env.SENDER_EMAIL,
			to: user.email,
			subject: "Account Verification OTP",
			// text: `Your OTP is ${otp}. Verify your account using this OTP.`,
			html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email),
		}

		// Send mail
		await transporter.sendMail(mailOption)

		res.json({ success: true, message: "Verification OTP send on email" })
	} catch (error) {
		res.json({ success: false, message: error.message })
	}
}

// Verify the email using OTP
export const verifiyEmail = async (req, res) => {
	const { userId, otp } = req.body

	// Check missing userId & OTP details
	if (!userId || !otp) {
		return res.json({ success: false, message: "Missing details" })
	}

	try {
		const user = await userModel.findById(userId)

		// Check user not found
		if (!user) {
			return res.json({ success: false, message: "User not found" })
		}

		// Check Invalid OTP
		if (user.verifyOtp === "" || user.verifyOtp !== otp) {
			return res.json({ success: false, message: "Invalid OTP" })
		}

		// Check OTP expired
		if (user.verifyOtpExpireAt < Date.now()) {
			return res.json({ success: false, message: "OPT expired" })
		}

		// Set account verified >> true
		user.isAccountVerified = true

		// Reset OTP details
		user.verifyOtp = ""
		user.verifyOtpExpireAt = 0

		// Save to OTP
		await user.save()

		return res.json({ success: true, message: "Email verified successfully" })
	} catch (error) {
		res.json({ success: false, message: error.message })
	}
}

// Check if user if authenticated
export const isAuthenticated = async (req, res) => {
	try {
		// If prcess pass from middleware to here it mean authenticated
		res.json({ success: true, message: "User is authenticated" })
	} catch (error) {
		res.json({ success: false, message: error.message })
	}
}

// Send password reset OTP
export const sendResetOtp = async (req, res) => {
	const { email } = req.body

	// Check email required
	if (!email) {
		return res.json({ sucess: false, message: "Email is required" })
	}

	try {
		const user = await userModel.findOne({ email })
		// Check found user
		if (!user) {
			return res.json({ sucess: false, message: "User not found" })
		}

		// Generate Otp
		const otp = String(Math.floor(100000 + Math.random() * 900000))

		// Set OTP & OTP Expire time
		user.resetOtp = otp
		user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000

		// Save to DB
		await user.save()

		// Set mail option for verify account with OTP
		const mailOption = {
			from: process.env.SENDER_EMAIL,
			to: user.email,
			subject: "Password Reset OTP",
			// text: `Your OTP for resetting your password is ${otp}. Use this OTP to proceed with resetting your password.`,
			html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email),
		}

		// Send mail
		await transporter.sendMail(mailOption)

		res.json({ success: true, message: "OTP sent to your email" })
	} catch (error) {
		res.json({ success: false, message: error.message })
	}
}

// Reset User Password
export const resetPassword = async (req, res) => {
	const { email, otp, newPassword } = req.body

	// Check Email, OTP, New password is required
	if (!email || !otp || !newPassword) {
		return res.json({ success: false, message: "Email, OTP and new password are required" })
	}

	try {
		const user = await userModel.findOne({ email })

		// Check user not found
		if (!user) {
			return res.json({ sucess: false, message: "User not found" })
		}

		// Check invalid OTP
		if (user.resetOtp === "" || user.resetOtp !== otp) {
			return res.json({ sucess: false, message: "Invalid OTP" })
		}

		// Check OTP expired
		if (user.resetOtpExpireAt < Date.now()) {
			return res.json({ sucess: false, message: "OTP Expired" })
		}

		// hash new password
		const hashedPassword = await bcrypt.hash(newPassword, 10)

		// Set new password
		user.password = hashedPassword

		// Reset reset OTP detail
		user.resetOtp = ""
		user.resetOtpExpireAt = 0

		// Save to DB
		await user.save()

		res.json({ success: true, message: "Password has been reset successfully" })
	} catch (error) {
		res.json({ success: false, message: error.message })
	}
}
