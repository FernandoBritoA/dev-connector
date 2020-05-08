const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcryptjs');

const User = require('../../models/User');

// @route  GET api/auth
// @desc   Test route
// @access Public
router.get('/', auth, async (req, res) => {
  try {
    //we can access req.user anywhere in a protected route
    // @ts-ignore
    const user = await User.findById(req.user.id).select('-password');
    //gives back user which id matches the one in the token (minus the pw)
    res.json(user);
    //this user object will be requested by our react app
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route  POST api/auth
// @desc   Authenticate user & get token SIGN IN
// @access Public
router.post(
  '/',
  [
    //validation
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  async (req, res) => {
    //Error handling
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
      //gives us back an array of the errors "param"+ "msg"
    }

    const { email, password } = req.body;
    try {
      // See if user exists
      let user = await User.findOne({ email });

      //If user doesnt exist
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid credentials' }] });
      }

      //Match user & password
      const isMatch = await bcrypt.compare(password, user.password);
      //if there is no match
      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid credentials' }] });
      }

      // Return jsonwebtoken
      const payload = {
        user: {
          id: user.id,
        },
      };

      //!change to 3600 when deploying
      //sign the token,
      //pass the payload,
      //pass expiration,
      //callback fn; return err or token
      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          //finally return our user token
          res.json({ token });
        }
      );
    } catch (err) {
      console.log(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
