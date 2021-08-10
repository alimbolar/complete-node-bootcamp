const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION 💥 :', err.name, err.message);
  console.log('STACK :', err.stack);
  console.log('Shutting down server...');
  process.exit();
});

const app = require('./app');

dotenv.config({ path: `${__dirname}/config.env` });

const DB = process.env.DATABASE.replace(
  '{%PASSWORD%}',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('DB Connected');
  });

const port = process.env.PORT || 3000;
const server = app.listen(port, '127.0.0.1', () =>
  console.log(`listening on ${port}`)
);

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION 💥 :', err.name, err.message);
  console.log('STACK :', err.stack);
  console.log('Shutting down server...');
  server.close(() => process.exit(1));
});
