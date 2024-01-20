var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var loginRouter = require('./routes/login');
var registerRouter = require('./routes/register');
var refreshRouter = require('./routes/refresh-token');

//Account
var registerRouter = require('./routes/register');
var createProfileRouter = require('./routes/account/create-profile');
var inviteMemberRouter = require('./routes/account/invite-new-member');
var verifyEmailRouter = require('./routes/account/verify-email');

// Movie routes
var movieListRouter = require('./routes/movie/movielist');
var movieCounterRouter = require('./routes/movie/movie-counter');
var movieTableRouter = require('./routes/movie/movietable');

// Serie routes
var serieListRouter = require('./routes/serie/serielist');
var serieTableRouter = require('./routes/serie/serietable');

// Genre routes
var genreListRouter = require('./routes/genre/genrelist');

// Finance routes
var dailyIncomeRouter = require('./routes/finance/get_daily_income');
var totalIncomeRouter = require('./routes/finance/get_total_income');


var app = express();

app.use(cors({ origin: 'http://localhost:4200', credentials: true }));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/login', loginRouter);
app.use('/register', registerRouter);
app.use('/refresh-token', refreshRouter);
app.use('/', indexRouter);
app.use('/users', usersRouter);

// Account Use
app.use("/register", registerRouter);
app.use("/account/create-profile", createProfileRouter);
app.use("/account/invite-new-member", inviteMemberRouter);
app.use("/account/verify-email", verifyEmailRouter);

// Movie use
app.use("/movie/movielist", movieListRouter);
app.use("/movie/movie-counter", movieCounterRouter);
app.use("/movie/movietable", movieTableRouter);

// Serie use
app.use("/serie/serielist", serieListRouter);
app.use("/serie/serietable", serieTableRouter);

// Genre use
app.use("/genre/genrelist", genreListRouter);

// Finance use
app.use("/finance/daily-income", dailyIncomeRouter);
app.use("/finance/total-income", totalIncomeRouter);

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
