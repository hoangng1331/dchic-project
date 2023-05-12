const yup = require('yup');
const validateSchema = (schema) => async (req, res, next) => {
  try {
    await schema.validate({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    return next();
  } catch (err) {
    return res.status(400).json({ type: err.name, message: err.message, provider: 'yup' });
  }
};
const loginSchema = yup.object({
  body: yup.object({
    username: yup.string().min(1).max(24).required(),
    password: yup.string().min(1).max(24).required(),
  }),
});
const registerSchema = yup.object({
  body: yup.object({
    firstname: yup.string().required(),
    lastname: yup.string().required(),
    email: yup.string().email().required(),
    phonenumber: yup.number().min(10).max(10).required(),
    password: yup.string().min(1).max(24).required(),
  }),
});

module.exports = {
  validateSchema, loginSchema, registerSchema
};
