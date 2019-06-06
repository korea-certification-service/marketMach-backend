var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');

var indexs = require('./backend/routes/indexs');
var usersRouter = require('./backend/routes/users');
var vtrsRouter = require('./backend/routes/vtrs');
var tradePointsRouter = require('./backend/routes/pointTrades');
var gamesRouter = require('./backend/routes/games');
var itemsRouter = require('./backend/routes/items');
var coinsRouter = require('./backend/routes/coins');
var pointsRouter = require('./backend/routes/points');
var notificationsRouter = require('./backend/routes/notifications');
var smsRouter = require('./backend/routes/sms');
var faqsRouter = require('./backend/routes/faqs');
var countryCodesRouter = require('./backend/routes/countryCodes');
var batchesRouter = require('./backend/routes/batches');
var communitysRouter = require('./backend/routes/communitys');
var noticesRouter = require('./backend/routes/notices');
var eventsRouter = require('./backend/routes/events');
var categoriesRouter = require('./backend/routes/categories');
var oppositionsRouter = require('./backend/routes/oppositions');
var personalsRouter = require('./backend/routes/personals');
var gameStationsRouter = require('./backend/routes/gameStations');

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
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

// app.use(session({
//     secret: 'bitweb123', //Only enable https
//     name: 'bitweb_sid',
//     // store: new MongoStore({ url: DB_URI}), // connect-mongo session store
//     proxy: false,
//     resave: true,
//     saveUninitialized: true,
//     cookie: {
//         // maxAge: 60 * 60 * 24 * 30 * 10000 // 쿠키 유효기간 하루 (24시간) * 30일 //현재 무기한
//         expires: 60 * 60 * 24 * 30 * 10000 // 쿠키 유효기간 하루 (24시간) * 30일 //현재 무기한
//     }
// }));


app.use('/', indexs);

//backend API
let version = "/v2";
app.use(version + '/users', usersRouter);
app.use(version + '/games', gamesRouter);
app.use(version + '/categories', categoriesRouter);
app.use(version + '/items', itemsRouter);
app.use(version + '/vtrs', vtrsRouter);
app.use(version + '/tradePoints', tradePointsRouter);
app.use(version + '/coins', coinsRouter);
app.use(version + '/points', pointsRouter);
app.use(version + '/notifications', notificationsRouter);
app.use(version + '/sms', smsRouter);
app.use(version + '/countryCodes',countryCodesRouter);
app.use(version + '/community',communitysRouter);
app.use(version + '/notices',noticesRouter);
app.use(version + '/faq',faqsRouter);
app.use(version + '/events', eventsRouter);
app.use(version + '/batches',batchesRouter);
app.use(version + '/oppositions', oppositionsRouter);
app.use(version + '/personals', personalsRouter);
app.use(version + '/gameStations', gameStationsRouter);

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