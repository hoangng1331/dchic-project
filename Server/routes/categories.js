// const { CONNECTION_STRING } = require('../constants/dbSettings');
// const { default: mongoose } = require('mongoose');
// mongoose.set('strictQuery', false);
// mongoose.connect(CONNECTION_STRING);
// const yup = require("yup");
// const express = require("express");
// const router = express.Router();
// // const shortid = require("shortid")
// const { write } = require("../helper/SaveFile");
// let data = require("../data/productname.json");
// const Categories = require("../models/Categories.js")
// // const { default: Categories } = require('../../server-site/src/admin-page/products');
// const SaveFile = "./data/productname.json";
// // GET
// router.get("/", function (req, res, next) {
//   res.send(data);
// });
// router.get("/:id", function (req, res, next) {
//   const { id } = req.params;
//   const found = data.find((p) => {
//     return p.id == id;
//   });
//   if (!found) {
//     return res.status(404);
//   }
//   res.send(found);
// });
// // POST
// router.post("/", function (req, res, next) {  
//   const data2 = req.body;
//    for (let i = 0; i <= data.length ; i++) {
//     b=i+1;
//     let a = b.toString().padStart(6, '0');
//     data2.id=a;
//    }      
  
//   data.push(data2);
//   write(SaveFile, data);
//   res.send(data);
// });
// //PATCH
// router.patch("/:id", function (req, res, next) {
//   const { id } = req.params;
//   const data2 = req.body;
//   let found = data.find((p) => {
//     return p.id == id;
//   });
//   if (found) {
//     for (let x in found) {
//       if (data2[x]) {
//         found[x] = data2[x];
//         res.sendStatus(200)
//       }
//     }
//   }
//   return res.sendStatus(404)
//   write(SaveFile, data);
  
// });
// //Delete
// router.delete("/:id", function (req, res, next) {
//         const { id } = req.params;
//         const found = data.find((p) => {
//           return p.id == id;
//         });
//         if (!found) {
//           return res.status(404);
//         }
//         let remainData = data.filter((p) =>{
//                 return p.id != id;
//         });
//         data = remainData;
//         write(SaveFile, data);
//         res.sendStatus(200);
//       });

// module.exports = router;
const { CONNECTION_STRING } = require('../constants/dbSettings');
const { default: mongoose } = require('mongoose');

const Category = require('../models/Category');
// MONGOOSE
mongoose.set('strictQuery', false);
mongoose.connect(CONNECTION_STRING);

const express = require('express');
const router = express.Router();

/* GET ALL */
router.get('/', function (req, res, next) {
  try {
    Category.find()
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
    Category.findById(_id)
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
    const newItem = new Category(data);
    
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

    Category.findByIdAndUpdate(_id, data, {
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
    Category.findByIdAndDelete(_id)
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
// QUESTIONS 18
// ------------------------------------------------------------------------------------------------
router.get('/questions/18', function (req, res, next) {
  try {
    const aggregate = [
      {
        $lookup: {
          from: 'products',
          let: { id: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$$_id', '$CategoriesId'] },
              },
            },
          ],
          as: 'products',
        },
      },
      {
        $addFields: { numberOfProducts: { $size: '$products' } },
      },
    ];
    Category.aggregate(aggregate)
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