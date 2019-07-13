var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');

//admin


//marketmach 
var commonRouter = require('./backend/v2/api/marketmach/routes/common');
var usersRouter = require('./backend/v2/api/marketmach/routes/users');
var vtrsRouter = require('./backend/v2/api/marketmach/routes/vtrs');

//management
var aboutUsers = require('./backend/v2/api/management/aboutusers');

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

//backend API
let version = "/v2";
app.use(version + '/', commonRouter);
app.use(version + '/users', usersRouter);
app.use(version + '/vtrs', vtrsRouter);

//management API
app.use('/about_users', aboutUsers);

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