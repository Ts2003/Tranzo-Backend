require("dotenv").config();

const databaseCredentials = process.env.DATABASE_CRED;

const mongoose = require("mongoose");

//creating an asynchronous function to make a connection to the mongodb
async function connectToMongo() {
    //connecting to the database with the help of mongoose.connect('connection string')
    await mongoose.connect(`mongodb+srv://${databaseCredentials}@atlascluster.ooqkesz.mongodb.net/`)

    //logging for validating
    console.log("Connection to database is successful")
}  

//exporting the modules
module.exports = connectToMongo;

