const { CONNECTION_STRING } = require('../constants/dbSettings');
const { default: mongoose } = require('mongoose');

const Customer = require('../models/Customer');
// MONGOOSE
mongoose.set('strictQuery', false);
mongoose.connect(CONNECTION_STRING);

const express = require('express');
const router = express.Router();

/* GET ALL */
router.get('/', function (req, res, next) {
  try {
    Customer.find()
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
router.get('/:_id', function (req, res, next) {
  try {
    const { _id } = req.params;
    Customer.findById(_id)
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

/* POST */
router.post('/', function (req, res, next) {
  try {
    const data = req.body;
    
    const newItem = new Customer(data);
    
    newItem
      .save()
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        console.log(err);
        res.status(400).send({ message: err.message });
      });
  } catch (err) {
    res.sendStatus(500);
  }
});

// PATCH
router.patch('/:_id', function (req, res, next) {
  try {
    const { _id } = req.params;
    const data = req.body;

    Customer.findByIdAndUpdate(_id, data, {
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
router.delete('/:_id', function (req, res, next) {
  try {
    const { _id } = req.params;  
    Customer.findByIdAndDelete(_id)
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

// // ------------------------------------------------------------------------------------------------
// // QUESTIONS 18
// // ------------------------------------------------------------------------------------------------
// router.get('/questions/18', function (req, res, next) {
//   try {
//     const aggregate = [
//       {
//         $lookup: {
//           from: 'products',
//           let: { id: '$_id' },
//           pipeline: [
//             {
//               $match: {
//                 $expr: { $eq: ['$$_id', '$CustomerId'] },
//               },
//             },
//           ],
//           as: 'products',
//         },
//       },
//       {
//         $addFields: { numberOfProducts: { $size: '$products' } },
//       },
//     ];
//     Customer.aggregate(aggregate)
//       .then((result) => {
//         res.send(result);
//       })
//       .catch((err) => {
//         res.status(400).send({ message: err.message });
//       });
//   } catch (err) {
//     res.sendStatus(500);
//   }
// });

module.exports = router;