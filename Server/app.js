var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwtSettings = require('./constants/jwtSettings');
// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');
var categoriesRouter = require('./routes/categories');
var customersRouter = require('./routes/customers')
var customerLoginRouter = require('./routes/customerLogin')
var productsRouter = require('./routes/products');
var colorsRouter = require('./routes/colors');
var employeesRouter = require('./routes/employees');
var ordersRouter = require('./routes/orders');
var authRouter = require('./routes/auth');
var loginRouter = require('./routes/login');
var sizesRouter = require('./routes/sizes')
var uploadRouter = require('./routes/upload');

const { findDocuments } = require('./helper/MongoDbHelper');
const bodyParser = require('body-parser');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(bodyParser.json());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  cors({
    origin: '*',
  }),
);


// Passport: jwt
const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = jwtSettings.SECRET;
opts.audience = jwtSettings.AUDIENCE;
opts.issuer = jwtSettings.ISSUER;

passport.use(
  new JwtStrategy(opts, function (payload, done) {
    console.log(payload);
      let error = null;
      let user = payload.account;
      return done(error, user);
  }),
);
app.use('/auth', authRouter);
app.use('/login', loginRouter);
app.use('/categories', categoriesRouter);
app.use('/customers', customersRouter);
app.use('/customerLogin', customerLoginRouter);
app.use('/products', productsRouter);
app.use('/colors', colorsRouter);
app.use('/employees', employeesRouter);
app.use('/orders', ordersRouter);
app.use('/upload', uploadRouter);
app.use('/sizes', sizesRouter);
// app.use('/ordersdetail', ordersdetailRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
