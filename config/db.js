const mongoose = require('mongoose'); //mongoose
const config = require('config'); //config file
const db = config.get('mongoURI'); //copied from MongoDB

const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      //deprecation warnings
    });
    console.log('MongoDB Connected...');
  } catch (error) {
    console.log(error.message);
    //exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
