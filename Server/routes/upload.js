const fs = require('fs');
const path = require('path');
const express = require('express');
const router = express.Router();
// MULTER UPLOAD
const multer = require('multer');
const { updateDocument, findDocument } = require('../helper/MongoDbHelper');

const UPLOAD_DIRECTORY = './public/uploads';

const upload = multer({
  storage: multer.diskStorage({
    contentType: multer.AUTO_CONTENT_TYPE,
    destination: function (req, file, callback) {
      const { id, collectionName, _id } = req.params;

      const PATH = `${UPLOAD_DIRECTORY}/${collectionName}/${id}/variants/${_id}`;
      if (!fs.existsSync(PATH)) {
        fs.mkdirSync(PATH, { recursive: true });
      }
      callback(null, PATH);
    },
    filename: function (req, file, callback) {
      const safeFileName = toSafeFileName(file.originalname);
      callback(null, safeFileName);
    },
  }),
}).array('files[]');

// router.post('/:collectionName/:id', async (req, res, next) => {
//   const { collectionName, id } = req.params;

//   const found = await findDocument(id, collectionName);
//   if (!found) {
//     return res.status(410).json({ message: `${collectionName} with id ${id} not found` });
//   }
//  console.log({found})
//   upload(req, res, async (err) => {
//     if (err instanceof multer.MulterError) {
//       res.status(500).json({ type: 'MulterError', err: err });
//     } else if (err) {
//       res.status(500).json({ type: 'UnknownError', err: err });
//     } else {
//       const newImageUrl = req.files.map((file) => `/uploads/${collectionName}/${id}/${file.filename}`);
//       await updateDocument(id, {imageUrl: newImageUrl}, collectionName);

//       const publicUrl = newImageUrl.map((imageUrl) => `${req.protocol}://${req.get('host')}${imageUrl}`);
//       res.status(200).json({ ok: true, publicUrl: publicUrl });
//     }
//   });
// });
router.post('/:collectionName/:id/variants/:_id', async (req, res, next) => {
  const { collectionName, id, _id} = req.params;
  const found = await findDocument(id, collectionName);
  if (!found) {
    return res.status(410).json({ message: `${collectionName} with id ${id} not found` });
  }
  const foundVariant = found.variants.find((variant) => variant._id.toString() === _id);

  if (!foundVariant) {
    return res.status(404).json({ message: `Variant with _id ${_id} not found` });
  }
  console.log({foundVariant})

  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      res.status(500).json({ type: 'MulterError', err: err });
    } else if (err) {
      res.status(500).json({ type: 'UnknownError', err: err });
    } else {
      const newImageUrl = req.files.map((file) => `/uploads/${collectionName}/${id}/variants/${_id}/${file.filename}`);
      const currentImageUrl = foundVariant.imageUrl || []; // Lấy ra các url hiện có trong mảng imageUrl
      const uniqueImageUrl = [...new Set([...currentImageUrl, ...newImageUrl])]; // Loại bỏ các url trùng lặp và tạo mảng mới
      await updateDocument(id, { $set: { 'variants.$[elem].imageUrl': uniqueImageUrl } }, collectionName, { arrayFilters: [{ 'elem._id': foundVariant._id }] });
      
      const publicUrl = newImageUrl.map((imageUrl) => `${req.protocol}://${req.get('host')}${imageUrl}`);
      res.status(200).json({ ok: true, publicUrl: publicUrl });
    }
  });
});




router.post('/:collectionName/:id/variants/:_id/images', async (req, res, next) => {
  const { collectionName, id, _id } = req.params;
  const found = await findDocument(id, collectionName);
  if (!found) {
    return res.status(410).json({ message: `${collectionName} with id ${id} not found` });
  }
  const foundVariant = found.variants.find((variant) => variant._id.toString() === _id);

  if (!foundVariant) {
    return res.status(404).json({ message: `Variant with _id ${_id} not found` });
  }
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      res.status(500).json({ type: 'MulterError', err: err });
    } else if (err) {
      res.status(500).json({ type: 'UnknownError', err: err });
    } else {
      const newImageUrls = req.files.map((file) => `/uploads/${collectionName}/${id}/variants/${_id}/${file.filename}`);
      let imageUrl = foundVariant.imageUrl || [];
      const uniqueUrls = [...new Set([...imageUrl, ...newImageUrls])];
      await updateDocument(id, { $set: { 'variants.$[elem].imageUrl': uniqueUrls } }, collectionName, { arrayFilters: [{ 'elem._id': foundVariant._id }] });
      

      const publicUrls = newImageUrls.map((imageUrl) => `${req.protocol}://${req.get('host')}${imageUrl}`);

      res.status(200).json({ ok: true, publicUrls: publicUrls });
    }
  });
});


function toSafeFileName(fileName) {
  const fileInfo = path.parse(fileName);
  const safeFileName = fileInfo.name.replace(/[^a-z0-9]/gi, '-').toLowerCase() + fileInfo.ext;
  return safeFileName;
}

module.exports = router;
