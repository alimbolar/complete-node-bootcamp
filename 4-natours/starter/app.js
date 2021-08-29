const path = require('path');
const express = require('express');
const morgan = require('morgan');
const AppError = require('./utils/AppError');
const globalErrorController = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');

// const Tour = require('./models/tourModel');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// // app.set('views', './views');

// MIDDLEWARE STACK
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use((req, res, next) => {
  console.log('Hello from the middleware');

  next();
});

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.all('*', function (req, res, next) {
  // res.status(404).json({
  //   status: 'error',
  //   message: `This route ${req.originalUrl} does not exist!`
  // });

  // const err = new Error(`💥 This route ${req.originalUrl} does not exist!`);
  // err.status = 'fail';
  // err.statusCode = 404;
  next(new AppError(`💥💥 This route ${req.originalUrl} does not exist!`, 404));
});

app.use(globalErrorController);

// app.get('/api/v1/tours/:id', getTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

// const port = 3000;

// app.listen(port, '127.0.0.1', () => console.log(`listening on ${port}`));

module.exports = app;
