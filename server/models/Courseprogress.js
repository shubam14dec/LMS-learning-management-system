const mongoose = require("mongoose");

const CourseProgress = mongoose.Schema({
        courseID:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Course"
        }, 
        completedvideos:[
            {
                type: mongoose.Schema.Types.ObjectId,
                ref:"Subsection"
            }
        ]

})

module.exports = mongoose.model("CourseProgress",CourseProgress);