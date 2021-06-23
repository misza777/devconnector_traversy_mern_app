const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const User = require("../../models/User");
const jwt = require("jsonwebtoken");
const config = require("config");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");

// @route  GET api/auth
// @desc   Test route
// @access Public

//auth w srodku zabezpiecza route w header info x-auth-token
//pierwsza wersja
// router.get("/", auth, (req, res) => res.send("User auth route"));
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Internal server error!");
  }
});

// @route  POST api/auth
// @desc   Autehticate user & get token
// @access Public

router.post(
  "/",
  [
    //walidacja logujacego

    body("email", "Please include valid email").isEmail(),
    //czy haslo istnieje exists()
    body("password", "Password is required!").exists(),
  ],
  async (req, res) => {
    console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      //400 bad request
      return res.status(400).json({ errors: errors.array() });
    }

    // destrukturyzacja req.body - wycigniecie pewnych danych
    const { email, password } = req.body;

    //  moze byc: User.findOne().then() ale uzywamy awaita wiec
    try {
      //see if user exists {email: email} porownuje
      let user = await User.findOne({ email });
      if (!user) {
        //bledne uwierzytelnienie - credentials
        return res.status(400).json([{ msg: "Invalid Credencials!" }]);
      }

      //korzytsamy z metody bycryptjs compare() zwraca promise
      const isMatch = await bcrypt.compare(password, user.password);

      //porownanie hasel tego co user wpisal i tego co jest encrypted
      if (!isMatch) {
        return res.status(400).json([{ msg: "Invalid Credencials!" }]);
      }

      //return jsonWebToken
      //user juz byl zapisany w bazie wiec jest
      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        //do produkcji trzeba zmienic na mniejszy czas 3600
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({
            token,
          });
        }
      );
      //serwer zwroci tokena wiec wykomantujemy linie ponizej
      // res.send("User registered");
    } catch (err) {
      console.error(err.message);
      res.status(500).send("server error");
    }
  }
);

module.exports = router;
