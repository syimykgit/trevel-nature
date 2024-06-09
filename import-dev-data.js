const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({ path: '../config.env' });
/////////////////////////////////////////////////////

const Tour = require('./model/tourModel');

const run = async () => {
  try {
    const data = await Tour.find();
    console.log(data);
  } catch (err) {
    console.log(err.message);
  }
};

run();

/////////////////////////////////////////////////////

const allTdata = JSON.parse(
  fs.readFileSync('./dev-data/data/tours.json', 'utf8'),
);

const importFn = async function () {
  try {
    await Tour.insertMany(allTdata);
    console.log('data imported');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const delateFn = async function () {
  try {
    await Tour.deleteMany();
    console.log('data deleted');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') importFn();

if (process.argv[2] === '--delete') delateFn();
