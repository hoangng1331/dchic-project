const { CONNECTION_STRING } = require('../constants/dbSettings');
const { default: mongoose } = require('mongoose');

const { Order } = require('../models');
// MONGOOSE
mongoose.set('strictQuery', false);
mongoose.connect(CONNECTION_STRING);

var express = require('express');

var router = express.Router();

/* GET ALL */
router.get('/', function (req, res, next) {
  try {
    Order.find()
      .populate('customer')
      .populate('verifier')
      .populate('shipper')
      .populate('employeeLogin')
      .populate('receiveMoneyConfirmer')
      .populate('orderDetails.product')
      .populate('orderDetails.size')
      .populate('orderDetails.color')
      // .populate({ path: 'orderDetails.product', populate: { path: 'category' } })
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
router.get('/:id', function (req, res, next) {
  try {
    const { id } = req.params;
    Order.findById(id)
      .populate('customer')
      .populate('shipper')
      .populate('verifier')
      .populate('employeeLogin')
      .populate('orderDetails.product')
      .populate('orderDetails.size')
      .populate('orderDetails.color')
      .populate('receiveMoneyConfirmer')
      // .populate({ path: 'orderDetails.product', populate: { path: 'category' } })
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

router.get('/:id/orderDetails', function (req, res, next) {
  const { id } = req.params;
  Order.findOne({_id: id})
  .populate('orderDetails.product')
  .populate('orderDetails.size')
  .populate('orderDetails.color')
    .then((result) => {
      if (!result) {
        res.status(404).send({ message: 'Order not found.' });
      } else {
        res.send(result.orderDetails);
      }
    })
    .catch((err) => {
      res.status(400).send({ message: err.message });
    });
});

router.get('/:id/orderDetails/:_id', function (req, res, next) {
  const { id, _id } = req.params;
  Order.findById(id)
    .then((result) => {
      if (!result) {
        res.status(404).send({ message: 'Order not found.' });
      } else {
        const orderDetails = result.orderDetails.find(detail => detail._id.toString() === _id);
        if (!orderDetails) {
          res.status(404).send({ message: 'Order detail not found.' });
        } else {
          res.send(orderDetails);
        }
      }
    })
    .catch((err) => {
      res.status(400).send({ message: err.message });
    });
});


/* POST */
router.post('/', function (req, res, next) {
  try {
    const data = req.body;

    const newItem = new Order(data);

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
router.post('/:id/orderDetails', function (req, res, next) {
  try {
    const { id } = req.params;
    const data = req.body;

    Order.findOneAndUpdate(
      { _id: id },
      { $push: { orderDetails: data } },
      { new: true }
    )
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
router.patch('/:id', function (req, res, next) {
  try {
    const { id } = req.params;
    const data = req.body;

    Order.findByIdAndUpdate(id, data, {
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
router.patch('/:id/orderDetails/:_id', function (req, res, next) {
  const { id, _id } = req.params;
  const { quantity } = req.body;
  Order.updateOne(
    { _id: id, 'orderDetails._id': _id },
    { $set: { 'orderDetails.$.quantity': quantity } }
  )
    .then((result) => {
      if (result.nModified === 0) {
        res.status(404).send({ message: 'Order detail not found.' });
      } else {
        res.send({ message: 'Quantity updated.' });
      }
    })
    .catch((err) => {
      res.status(400).send({ message: err.message });
    });
});

// DELETE
router.delete('/:id', function (req, res, next) {
  try {
    const { id } = req.params;
    Order.findByIdAndDelete(id)
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
router.delete('/:id/orderDetails/:_id', function (req, res, next) {
  try {
    const { id, _id } = req.params;
    Order.findOneAndUpdate(
      { _id: id },
      { $pull: { orderDetails: { _id: _id } } },
      { new: true }
    )
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


// ------------------------------------------------------------------------------------------------
// QUESTIONS 8
// ------------------------------------------------------------------------------------------------
router.post('/status', function(req, res, next) {
  try {
    const { status, deliveryArea, paymentType, paymentStatus } = req.body;

    const query = {};
    if (status) {query.status = status};
    if (deliveryArea) {query.deliveryArea = deliveryArea};
    if (paymentType) {query.paymentType = paymentType};
    if (paymentStatus) {query.paymentStatus = paymentStatus};

    Order.find(query)
      .populate('customer')
      .populate('shipper')
      .populate('verifier')
      .populate('employeeLogin')
      .populate('receiveMoneyConfirmer')
      .populate('orderDetails.product')
      .populate('orderDetails.size')
      .populate('orderDetails.color')
      .then((result) => {
        res.send(result); // trả về các đơn hàng kết quả
      })
      .catch((err) => {
        res.status(400).send({ message: err.message });
      });
  } catch (err) {
    res.sendStatus(500);
  }
});
router.post('/status&shipperId', function(req, res, next) {
  try {
    const { shipperId, status, shippingFee } = req.body;

    const query = {};
    if (shipperId && status) {
      query.shipperId = shipperId;
      query.status = status;
    } else if (shippingFee && status) {
      query.shippingFee = shippingFee;
      query.status = status;
    } else {
      res.status(400).send({ message: 'Invalid request. Please provide at least one parameter.' });
      return;
    }


    Order.find(query)
      .populate('customer')
      .populate('shipper')
      .populate('verifier')
      .populate('employeeLogin')
      .populate('orderDetails.product')
      .populate('orderDetails.size')
      .populate('orderDetails.color')
      .populate('receiveMoneyConfirmer')
      .then((result) => {
        res.send(result); // trả về các đơn hàng kết quả
      })
      .catch((err) => {
        res.status(400).send({ message: err.message });
      });
  } catch (err) {
    res.sendStatus(500);
  }
});
router.post('/status&customerId', function(req, res, next) {
  try {
    const { customerId, status } = req.body;

    const query = {};
    if (customerId) {query.customerId = customerId;}
      if (status) { query.status = status;}
   

    Order.find(query)
      .populate('customer')
      .populate('shipper')
      .populate('verifier')
      .populate('employeeLogin')
      .populate('orderDetails.product')
      .populate('orderDetails.size')
      .populate('orderDetails.color')
      .populate('receiveMoneyConfirmer')
      .then((result) => {
        res.send(result); // trả về các đơn hàng kết quả
      })
      .catch((err) => {
        res.status(400).send({ message: err.message });
      });
  } catch (err) {
    res.sendStatus(500);
  }
});

router.post('/status&date&shipper', async (req, res) => {
  try {
    const { status, shipperId, shippedDateFrom, shippedDateTo, deliveryArea } = req.body;
    const query = {};
    if (shipperId) {query.shipperId = shipperId};
    if (shippedDateFrom && shippedDateTo){query.shippedDate ={
      $gte: shippedDateFrom, 
      $lte: shippedDateTo, 
    } }
    if (status) {query.status = status};
    if (deliveryArea) {query.deliveryArea = deliveryArea};
    // Query the database using the built query object
    const orders = await Order.find(query)
      .populate('customer')
      .populate('shipper')
      .populate('verifier')
      .populate('employeeLogin')
      .populate('orderDetails.product')
      .populate('receiveMoneyConfirmer')
      .populate('orderDetails.size')
      .populate('orderDetails.color');

    res.send(orders);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

module.exports = router;
