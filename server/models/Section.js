const mongoose = require("mongoose");

const Sectionschema = mongoose.Schema({

       sectionName:{
        type:String
       }, 
       subsection:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Subsection",
        required:true
       }]

})

module.exports = mongoose.model("Section",Sectionschema);