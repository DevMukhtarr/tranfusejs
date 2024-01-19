import jwt from "jsonwebtoken";

const config = process.env;

export const verifyToken = (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers["x-access-token"];
  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    const decoded = jwt.verify(token, config.JWT_TOKEN_KEY);
    req.user = decoded;
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: "Invalid Token"+err 
    })
  }
  return next();
};