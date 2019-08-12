var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
let cors = require('cors');

//admin


//marketmach 
var usersRouter = require('./backend/v2/api/marketmach/routes/users');
var vtrsRouter = require('./backend/v2/api/marketmach/routes/vtrs');
var itemsRouter = require('./backend/v2/api/marketmach/routes/items');
var communityRouter = require('./backend/v2/api/marketmach/routes/communitys');
var kycRouter = require('./backend/v2/api/marketmach/routes/kyc');
var commonRouter = require('./backend/v2/api/marketmach/routes/common');

//management
var maUsers = require('./backend/v2/api/management/ma_users');
var maWithdrawusers = require('./backend/v2/api/management/ma_withdrawusers');
var maCoins = require('./backend/v2/api/management/ma_coins');
var maEscrows = require('./backend/v2/api/management/ma_escrows');
var maPoints = require('./backend/v2/api/management/ma_points');
var blacklist = require('./backend/v2/api/management/ma_blacklist');
var kycs = require('./backend/v2/api/management/ma_kyc');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

app.use('/', commonRouter);

//backend API
let version = "/v2";
app.use(version + '/items', itemsRouter);
app.use(version + '/users', usersRouter);
app.use(version + '/vtrs', vtrsRouter);
app.use(version + '/kycs', kycRouter);
app.use(version + '/community', communityRouter);

//management API
app.use('/ma_users', maUsers);
app.use('/ma_withdrawusers', maWithdrawusers);
app.use('/ma_coins', maCoins);
app.use('/ma_escrows', maEscrows);
app.use('/ma_points', maPoints);
app.use('/ma_blacklist', blacklist);
app.use('/ma_kyc', kycs);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  console.log(err);

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;