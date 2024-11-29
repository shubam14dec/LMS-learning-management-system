const mongoose = require("mongoose");
require("dotenv").config();

exports.dbconnect = ()=>{
        mongoose.connect(process.env.MONGODB_URL,{
            useNewUrlParser:true,
            useUnifiedTopology:true
        })
        .then(console.log("Database connected successfully"))
        .catch((error)=>{
            console.log(error);
            process.exit(1);
        })
};