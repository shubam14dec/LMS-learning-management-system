const mongoose = require("mongoose");

const Courseschema = mongoose.Schema({
        courseName:{
            type:String,
        },
        courseDescription:{
            type:String
        },
        instructor:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        
        whatyouwilllearn:{
            type:String
        },

        courseContent:[{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Section"
        }],

        ratingAndReview:[{
            type:mongoose.Schema.Types.ObjectId,
            ref:"RatingAndReview"
        }],
        price:{
            type:Number
        },
        tags: {
            type: [String],
            required: true,
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
        },
        thumbnail:{
            type:String
        },

        studentEnrolled:[{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
        }],
        
})

module.exports = mongoose.model("Course",Courseschema);