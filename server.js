const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: './config.env' });

//////////////// handling sync err ////////////////////////
process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  process.exit(1);
});
const DB = process.env.DATABASE_URL.replace(
  '<DATABASE_PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose.connect(DB).then(() => {
  console.log(`DB connection successful`);
}); //////////////// handling err ////////////////////////
// .catch((err) => console.log(err.message));

const app = require('./app');

const server = app.listen(3000, () => {
  console.log('runing on port 3000');
});

//////////////// handling async err ////////////////////////
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// const x = document.getElementsByClassName('card__picture-overlay');
