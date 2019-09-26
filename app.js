var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
let cors = require('cors');


//marketmach 
var usersRouter = require('./backend/v2/api/marketmach/routes/users');
var vtrsRouter = require('./backend/v2/api/marketmach/routes/vtrs');
var itemsRouter = require('./backend/v2/api/marketmach/routes/items');
var communityRouter = require('./backend/v2/api/marketmach/routes/communitys');
var kycRouter = require('./backend/v2/api/marketmach/routes/kyc');
var faqRouter = require('./backend/v2/api/marketmach/routes/faq');
var smsRouter = require('./backend/v2/api/marketmach/routes/sms');
var coinRouter = require('./backend/v2/api/marketmach/routes/coin');
var gameStationRouter = require('./backend/v2/api/marketmach/routes/gameStation');
var mainRouter = require('./backend/v2/api/marketmach/routes/main');
var commonRouter = require('./backend/v2/api/marketmach/routes/common');

//management
var maUsers = require('./backend/v2/api/management/ma_users');
var maWithdrawusers = require('./backend/v2/api/management/ma_withdrawusers');
var maBlacklist = require('./backend/v2/api/management/ma_blacklist');
var maCoins = require('./backend/v2/api/management/ma_coins');
var maEscrows = require('./backend/v2/api/management/ma_escrows');
var maPoints = require('./backend/v2/api/management/ma_points');
var maKyc = require('./backend/v2/api/management/ma_kyc');
var maCoinhistorys = require('./backend/v2/api/management/ma_coinhistory');
var maPointBankHistorys = require('./backend/v2/api/management/ma_pointBankHistorys');
var maVtrs = require('./backend/v2/api/management/ma_vtrs');
var maEscrowsHistory = require('./backend/v2/api/management/ma_escrowHistorys');
var maLogin = require('./backend/v2/api/management/ma_login');
var session = require('express-session');
var maItems = require('./backend/v2/api/management/ma_items');
var maBanners = require('./backend/v2/api/management/ma_banner');

var app = express();

app.use(session({
  secret: 'bitweb123', //Only enable https
  name: 'bitweb_sid',
  // store: new MongoStore({ url: DB_URI}), // connect-mongo session store
  proxy: false,
  resave: true,
  saveUninitialized: true,
  cookie: {
      // maxAge: 60 * 60 * 24 * 30 * 10000 // 쿠키 유효기간 하루 (24시간) * 30일 //현재 무기한
      expires: 60 * 60 * 24 * 30 * 10000 // 쿠키 유효기간 하루 (24시간) * 30일 //현재 무기한
  }
}));


//body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));

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
app.use(version + '/faq', faqRouter);
app.use(version + '/sms', smsRouter);
app.use(version + '/coin', coinRouter);
app.use(version + '/gamestation', gameStationRouter);
app.use(version + '/main', mainRouter);


//management API
app.use('/ma_users', maUsers);
app.use('/ma_withdrawusers', maWithdrawusers);
app.use('/ma_blacklist', maBlacklist);
app.use('/ma_coins', maCoins);
app.use('/ma_escrows', maEscrows);
app.use('/ma_points', maPoints);
app.use('/ma_kyc', maKyc);
app.use('/ma_coinhistory', maCoinhistorys);
app.use('/ma_pointbankhistory', maPointBankHistorys);
app.use('/ma_vtrs', maVtrs);
app.use('/ma_escrowHistorys', maEscrowsHistory);
app.use('/ma_login', maLogin);
app.use('/ma_items', maItems);
app.use('/ma_banners', maBanners);

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