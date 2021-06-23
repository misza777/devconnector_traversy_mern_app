const mongoDb = require("mongoose");
const config = require("config");
const db = config.get("mongoURI");

// await and db as parameter gives us promise

const connectDB = async () => {
  try {
    await mongoDb.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });
    console.log("MongoDB Connected...!");
  } catch (err) {
    console.error(err.message);
    //Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
