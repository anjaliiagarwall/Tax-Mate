const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    // Expect: Bearer <token>
    const token = authHeader.replace("Bearer ", "");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // { id, email }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token is not valid" });
  }
};
