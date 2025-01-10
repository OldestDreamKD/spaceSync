const mongoose = require("mongoose");
require('dotenv').config();

async function connectToDatabase() {
  try {
    const mongousername = process.env.MONGO_USERNAME;
    const mongopassword = process.env.MONGO_PASSWORD;
    const mongodb = process.env.MONGO_DB;
    const url = `mongodb+srv://${mongousername}:${mongopassword}@cluster0.aqlnrgj.mongodb.net/${mongodb}`;
    await mongoose.connect(url);    
    console.log("Successfully connected to the database.");
    // await mongoose.connect("mongodb://localhost:27017/${process.env.MONGO_DB}");
  } catch (error) {
    console.error("Error connecting to the database: ", error);
  }
}

module.exports = connectToDatabase;