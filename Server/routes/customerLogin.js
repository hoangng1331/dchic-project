var express = require('express');
var router = express.Router();

const { findDocuments, findDocument } = require('../helper/MongoDbHelper');

const Customer = require('../models/Customer');

var passport = require('passport');
var jwt = require('jsonwebtoken');
const jwtSettings = require('../constants/jwtSettings');

const yup = require('yup');
var { validateSchema } = require('../validation/validateSchema');
const { get } = require('mongoose');

const loginSchema = yup.object({
  body: yup.object({
    username: yup.string().required(),
    password: yup.string().min(1).max(31).required(),
    }),
});

// ------------------------------------------------------------------------------------------------
// LOGIN WITH JWT + REFRESH TOKEN 
// ------------------------------------------------------------------------------------------------
    router.post('/login-jwt', async (req, res, next) => {
      const { username, password } = req.body;

      const found = await Customer.findOne({
        username,
        password,
      });

      if (found) {
        const id = found._id.toString();
        // Cấp token
        // jwt
        const payload = {
          message: 'payload',
          account: found,
        };

        const secret = jwtSettings.SECRET;

        // ACCESS TOKEN
        const token = jwt.sign(payload, secret, {
          expiresIn: 1800, //24 * 60 * 60, // expires in 24 hours (24 x 60 x 60)
          audience: jwtSettings.AUDIENCE,
          issuer: jwtSettings.ISSUER,
          subject: id, // Thường dùng để kiểm tra JWT lần sau
          algorithm: 'HS512',
        });

        // REFRESH TOKEN
        const refreshToken = jwt.sign(
          {
            id,
          },
          secret, 
          {
            expiresIn: '365d', // expires in 24 hours (24 x 60 x 60)
          },
        );
        res.send({ message: 'Login success!', loggedInUser: found, token, refreshToken });
        return;
      }

      res.status(401).send({ message: 'Login failed!' });
    });




    // ------------------------------------------------------------------------------------------------
    // REFRESH TOKEN
    // ------------------------------------------------------------------------------------------------
    router.post('/refresh-token', async (req, res, next) => {
      const { refreshToken } = req.body;
      jwt.verify(refreshToken, jwtSettings.SECRET, async (err, decoded) => {
        if (err) {
          return res.status(401).json({ message: 'refreshToken is invalid' });
        } else {
          const { id } = decoded;

          const user = await Customer.findById(id);

          if (user) {
            console.log(user);
            const secret = jwtSettings.SECRET;

            const payload = {
              message: 'payload',
              account: user,
            };

            const token = jwt.sign(payload, secret, {
              expiresIn: 1800, //24 * 60 * 60, // expires in 24 hours (24 x 60 x 60)
              audience: jwtSettings.AUDIENCE,
              issuer: jwtSettings.ISSUER,
              subject: id, // Thường dùng để kiểm tra JWT lần sau
              algorithm: 'HS512',
            });

            return res.json({ token });
          }
          return res.sendStatus(401);
        }
      });
 }
    );



    // CHECK ROLES
    const allowActive = (active) => (req, res, next) => {
      if (req.user && req.user.active === active) {
        next();
      } else {
        res.status(403).send({ message: 'Account has been banned' });
      }
    };

    router.get('/authentication', passport.authenticate('jwt', { session: false }),async (req, res) => {
    res.send(req.user)
    });

    module.exports = router;
