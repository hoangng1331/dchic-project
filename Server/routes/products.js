const yup = require('yup');
var { validateSchema } = require('../validation/validateSchema');

const { CONNECTION_STRING } = require('../constants/dbSettings');
const { default: mongoose } = require('mongoose');

const { Product } = require('../models');
// MONGOOSE
mongoose.set('strictQuery', false);
mongoose.connect(CONNECTION_STRING);

var express = require('express');
var router = express.Router();

/* GET ALL */
router.get('/', function (req, res, next) {
  try {
    Product.find()
    .populate('category')
    .populate('color')
    .populate('size')
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
    Product.findById(id)
    .populate('category')
      .populate('color')
      .populate('size')
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

router.get('/:id/variants', function (req, res, next) {
  const { id } = req.params;
  Product.findOne({_id: id})
     .populate('color')
      .populate('size')
    .then((result) => {
      if (!result) {
        res.status(404).send({ message: 'Product not found.' });
      } else {
        res.send(result.variants);
      }
    })
    .catch((err) => {
      res.status(400).send({ message: err.message });
    });
});

router.get('/:id/variants/:_id', function (req, res, next) {
  const { id, _id } = req.params;
  Product.findById(id)
      .populate('color')
      .populate('size')
    .then((result) => {
      if (!result) {
        res.status(404).send({ message: 'Variant not found.' });
      } else {
        const variants = result.variants.find(detail => detail._id.toString() === _id);
        if (!variants) {
          res.status(404).send({ message: 'Variant detail not found.' });
        } else {
          res.send(variants);
        }
      }
    })
    .catch((err) => {
      res.status(400).send({ message: err.message });
    });
});

router.get('/:id/variants/:_id/sizes', function (req, res, next) {
  const { id, _id } = req.params;
  Product.findById(id)
      .populate('size')
    .then((result) => {
      if (!result) {
        res.status(404).send({ message: 'Variant not found.' });
      } else {
        const variants = result.variants.find(detail => detail._id.toString() === _id);
        if (!variants) {
          res.status(404).send({ message: 'Variant detail not found.' });
        } else {
          const variantSizes = variants.sizes;
          res.send(variantSizes);
        }
      }
    })
    .catch((err) => {
      res.status(400).send({ message: err.message });
    });
});

router.get('/:id/variants/:_id/sizes/:sId', function (req, res, next) {
  const { id, _id, sId } = req.params;
  Product.findById(id)
      .populate('size')
    .then((result) => {
      if (!result) {
        res.status(404).send({ message: 'Variant not found.' });
      } else {
        const variant = result.variants.find(detail => detail._id.toString() === _id);
        if (!variant) {
          res.status(404).send({ message: 'Variant detail not found.' });
        } else {
          const size = variant.sizes.find(size => size._id.toString() === sId);
          if (!size) {
            res.status(404).send({ message: 'Size not found.' });
          } else {
            res.send(size);
          }
        }
      }
    })
    .catch((err) => {
      res.status(400).send({ message: err.message });
    });
});


router.get('/:id/variants/:colorId/sizes/:sizeId/order', function (req, res, next) {
  const { id, colorId, sizeId } = req.params;
  Product.findOne(
    { _id: id, variants: { $elemMatch: { colorId, 'sizes.sizeId': sizeId } } },
    { 'variants.$': 1 }
  ) 
    .then((result) => {
      if (!result) {
        res.status(404).send({ message: 'Product not found.' });
      } else {
        const variant = result.variants[0];
        if (!variant) {
          res.status(404).send({ message: 'Product variant not found.' });
        } else {
          const size = variant.sizes.find((s) => String(s.sizeId) === sizeId);
          if (!size) {
            res.status(404).send({ message: 'Product size not found.' });
          } else {
            res.send(size);
          }
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

    const newItem = new Product(data);

    newItem
      .save()
      .then((result) => {
        res.status(201).send(result);
      })
      .catch((err) => {
        console.log(err);
        res.status(400).send({ message: err.message });
      });
  } catch (err) {
    res.sendStatus(500);
  }
});

router.post('/:id/variants', function (req, res, next) {
  try {
    const { id } = req.params;
    const data = req.body;

    Product.findOneAndUpdate(
      { _id: id },
      { $push: { variants: data } },
      { new: true }
    )
      .then((result) => {
        const newVariant = result.variants[result.variants.length - 1];
        res.send(newVariant);
      })
      .catch((err) => {
        console.log(err);
        res.status(400).send({ message: err.message });
      });
  } catch (err) {
    res.sendStatus(500);
  }
});
router.post('/:id/variants/:_id/sizes', function (req, res, next) {
  const { id, _id } = req.params;
  const data = req.body;
  Product.findOneAndUpdate(
    { _id: id, "variants._id": _id },
    { $push: { "variants.$.sizes": data } },
    { new: true }
  )
    .then((result) => {
      if (!result) {
        res.status(404).send({ message: 'Variant not found.' });
      } else {
        const variants = result.variants.find(detail => detail._id.toString() === _id);
        if (!variants) {
          res.status(404).send({ message: 'Variant detail not found.' });
        } else {
          res.send(variants);
        }
      }
    })
    .catch((err) => {
      res.status(400).send({ message: err.message });
    });
});


// PATCH
router.patch('/:id', function (req, res, next) {
  try {
    const { id } = req.params;
    const data = req.body;

    Product.findByIdAndUpdate(id, data, {
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

router.patch('/:id/variants/:_id', function (req, res, next) {
  const { id, _id } = req.params;
  const { colorId, price, discount, imageUrl } = req.body;
  Product.updateOne(
    { _id: id, 'variants._id': _id },
    { $set: { 
      'variants.$.colorId': colorId,
      'variants.$.price': price,
      'variants.$.discount': discount,
      'variants.$.imageUrl': imageUrl
    } }
  )
    .then((result) => {
      if (result.nModified === 0) {
        res.status(404).send({ message: 'Product variant not found.' });
      } else {
        res.send({ message: 'Product variant updated.' });
      }
    })
    .catch((err) => {
      res.status(400).send({ message: err.message });
    });
});

router.patch('/:id/variants/:_id/sizes/:sId', function (req, res, next) {
  const { id, _id, sId } = req.params;
  const { quantity, sizeId } = req.body;
  Product.findOneAndUpdate(
    {
      _id: id,
      "variants._id": _id,
      "variants.sizes._id": sId
    },
    {
      $set: {
        "variants.$[variant].sizes.$[size].quantity": quantity,
        "variants.$[variant].sizes.$[size].sizeId": sizeId
      }
    },
    {
      arrayFilters: [
        { "variant._id": _id },
        { "size._id": sId }
      ],
      new: true // Trả về document đã được update
    }
  )
  .then((result) => {
    if (!result) {
      res.status(404).send({ message: 'Product, variant or size not found.' });
    } else {
      res.send(result);
    }
  })
  .catch((err) => {
    console.log(err);
    res.status(400).send({ message: err.message });
  });
});


router.patch('/:id/variants/:colorId/sizes/:sizeId/order', function (req, res, next) {
  const { id, colorId, sizeId } = req.params;
  const { quantity } = req.body;
  Product.updateOne(
    { _id: id, variants: { $elemMatch: { colorId, 'sizes.sizeId': sizeId } } },
    { $set: { 'variants.$[i].sizes.$[j].quantity': quantity } },
    { arrayFilters: [{ 'i.colorId': colorId }, { 'j.sizeId': sizeId }] }
  )
    .then((result) => {
      if (result.nModified === 0) {
        res.status(404).send({ message: 'Product not found.' });
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
    Product.findByIdAndDelete(id)
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
router.delete('/:id/variants/:_id', function (req, res, next) {
  try {
    const { id, _id } = req.params;
    Product.findOneAndUpdate(
      { _id: id },
      { $pull: { variants: { _id: _id } } },
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

router.delete('/:id/variants/:_id/sizes/:sId', function (req, res, next) {
  const { id, _id, sId } = req.params;

  Product.findOneAndUpdate(
    { _id: id, 'variants._id': _id },
    { $pull: { 'variants.$.sizes': { _id: sId } } },
    { new: true }
  )
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.status(400).send({ message: err.message });
    });
});





//Query

router.post('/category', function(req, res, next) {
  try {
    const { categoryId } = req.body;

    const query = {};
    if (categoryId) query.categoryId = categoryId;

    Product.find(query)
    .populate('category')
    .populate('color')
    .populate('size')
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
router.post('/promotion', function(req, res, next) {
  try {
    const { promotion } = req.body;

    const query = {};
    if (promotion) query.promotion = promotion;

    Product.find(query)
    .populate('category')
    .populate('color')
    .populate('size')
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
