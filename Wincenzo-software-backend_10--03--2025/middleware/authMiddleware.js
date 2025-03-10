const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const authenticateUser = async (req, res, next) => {


  try {
    var token;
    if (req.headers?.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res
        .status(401)
        .json({ message: "Authorization token is required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.userId) {
      return res
        .status(401)
        .json({ message: "Invalid token: userId not found" });
    }

    const user = await User.findById(decoded.userId);


    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    // if (error instanceof jwt.TokenExpiredError) {
    //   return res.status(401).json({ message: "Token expired" });
    // }
    return res.status(401).json({ message: "Invalid token" });
  }
};

const checkUserRole = (roles) => {

  return async (req, res, next) => {
    try {
      if (!req.user || !req.user._id) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const userId = req.user._id;
      const user = await User.findById(userId);
      console.log("role::::", user.role)



      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      if (!roles.includes(user.role)) {
        return res.status(403).json({ message: "Unauthorized access" });
      }

      next();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
};

module.exports = {
  authenticateUser,
  checkUserRole,
};
