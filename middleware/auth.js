const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
  //get token from header
  const token = req.header("x-auth-token");

  //check if no token 401 - unauthorized clien error status
  if (!token) {
    return res
      .status(401)
      .json({ msg: "Sorry! No token, authorization denied!" });
  }

  //verify token
  try {
    const decoded = jwt.verify(token, config.get("jwtSecret"));
    //    przypisanie usera do zdekodowanego tokenu
    req.user = decoded.user;
    //jak nastapi autoryzacja to mamy dostep do route'ow i danych np profilu
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};
