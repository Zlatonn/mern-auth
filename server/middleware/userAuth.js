import jwt from "jsonwebtoken"

const userAuth = async (req, res, next) => {
	const { token } = req.cookies

	// Check have cookies
	if (!token) {
		return res.json({ success: false, message: "Not authorized. Login again" })
	}

	try {
		const tokenDecode = jwt.verify(token, process.env.JWT_SECRET)

		// Verify token
		if (!tokenDecode.id) {
			return res.json({ success: false, message: "Not authorized. Login again" })
		}

		// Set user ID with to decoded token
		req.body = req.body || {} //temporary fix req.body is undifined
		req.body.userId = tokenDecode.id

		next()
	} catch (error) {
		res.json({ success: false, message: error.message })
	}
}

export default userAuth
