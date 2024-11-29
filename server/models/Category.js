const mongoose = require("mongoose");

const CategorySchema = mongoose.Schema({
      name:{
        type:String,
        required:true
      },
      description:{
        type:String
      },
      course:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course"
      }]

})

module.exports = mongoose.model("Category",CategorySchema);