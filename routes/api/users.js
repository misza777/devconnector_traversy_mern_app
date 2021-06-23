const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const jwt = require("jsonwebtoken");
const config = require("config");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
// zmienna user dostep do schema z pliku User
const User = require("../../models/User");

// @route  POST api/users
// @desc   Register user
// @access Public

router.post(
  "/",
  [
    //walidacja nowego usera
    //not /notEmpty must be like this!!!
    body("name", "Name is required").not().isEmpty(),
    body("email", "Please include valid email").isEmail(),
    body(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      //400 bad request
      return res.status(400).json({ errors: errors.array() });
    }

    // destrukturyzacja req.body - wycigniecie pewnych danych
    const { name, email, password } = req.body;

    //  moze byc: User.findOne().then() ale uzywamy awaita wiec
    try {
      //see if user exists {email: email} porownuje
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json([{ msg: "User already exist" }]);
      }

      //get users gravatar
      const avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm",
      });
      //create new user
      user = new User({
        name,
        email,
        avatar,
        password,
      });
      //encrypt password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      //wszedzie gdzie zwraca promise tam musisz dac await
      await user.save();

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
      //rozgryzc gravatara :)
      //serwer zwroci tokena wiec wykomantujemy linie ponizej
      // res.send("User registered");
    } catch (err) {
      console.error(err.message);
      res.status(500).send("server error");
    }
  }
);

module.exports = router;
