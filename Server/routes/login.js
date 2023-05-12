const { CONNECTION_STRING } = require('../constants/dbSettings');
const { default: mongoose } = require('mongoose');

const Login = require('../models/Login')
// MONGOOSE
mongoose.set('strictQuery', false);
mongoose.connect(CONNECTION_STRING);

var express = require('express');

var router = express.Router();

/* GET ALL */
router.get("/", function (req, res, next) {
  try {
    Login.find()
      .populate({ path: 'name', select: 'firstName lastName fullName phoneNumber' })
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        res.status(400).send({ message: err.message });
      });
  } catch (err) {
    res.sendStatus(500);
  }
});

/* GET BY ID */
router.get("/:id", function (req, res, next) {
  try {
    const { id } = req.params;
    Login.findById(id)
    .populate({ path: 'name', select: 'firstName lastName fullName phoneNumber' })
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        res.status(400).send({ message: err.message });
      });
  } catch (err) {
    res.sendStatus(500);
  }
});
router.get('/username/:username', async (req, res) => {
  try {
    const user = await Login.findOne({ username: req.params.username }).populate({ path: 'name', select: 'firstName lastName fullName phoneNumber' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH
router.patch('/:id', function (req, res, next) {
  try {
    const { id } = req.params;
    const {username, password, role, status, active} = req.body;
       Login.findByIdAndUpdate(id, {username, password, role, status, active}, {
      new: true,
    })
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        res.status(400).send({ message: err.message });
      });
  } catch (error) {
    res.sendStatus(500);
  }
});

// DELETE
router.delete('/:id', function (req, res, next) {
  try {
    const { id } = req.params;
    Login.findByIdAndDelete(id)
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        res.status(400).send({ message: err.message });
      });
  } catch (err) {
    res.sendStatus(500);
  }
});
router.delete('/employeeId/:employeeId', async (req, res) => {
  try {
    Login.findOneAndDelete({ employeeId: req.params.employeeId })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.status(400).send({ message: err.message });
    });
} catch (err) {
  res.sendStatus(500);
}
});

module.exports = router;
