import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  try {
    let token;

    // 1. Check Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    // 2. Or check cookies
    if (!token && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.json({ success: false, message: "Not Authorized, Login again" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = { id: decoded.id };
    next();
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export default userAuth;
