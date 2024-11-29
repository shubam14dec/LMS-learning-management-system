const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");

exports.createRating = async (req,res)=>{
    try{
        const userId = req.user.id;
        const {rating,review,courseId}=req.body;
        const courseDetails = await Course.findById(courseId);
       if(!courseDetails.studentEnrolled.includes(userId)){
        return res.status(404).json({
            success:false,
            message:`student not enrolled in the course ${courseId}`
        })
       }
       // check if user already given the rating , then do not allow him
       const alreadyreviewed = await RatingAndReview.findOne({user:user.id , course:courseId});
       if(alreadyreviewed){
        return res.status(400).json({
            success:false,
            message:"user already reviewed the course"
        })
       }
       const ratingReview = await RatingAndReview.create({
            rating,
            review,
            course:courseId,
            user:userId
       })
       await Course.findByIdAndUpdate(courseId,{$push:{ratingAndReview:ratingReview._id}},{new:true});
       return res.status(200).json({
        success:true,
        message:`created rating successfully for course ${courseId} and user ${userId}`,
       })

    }catch(error){
        res.status(500).json({
            success:false,
            message:"not able create rating"
        })
    }
}

exports.getAverageRating = async(req,res)=>{
    try{
        const {courseId} = req.body;
        const course = await Course.findById(courseId);
        const ratingandreview = course.ratingAndReview;
        if(ratingandreview.length == 0){
            return res.status(404).json({
                success:false,
                message:"rating of this course is not available",
                average:0
            })
        }
        let sum=0;
        for(let i=0;i<ratingandreview.length;i++){
            const individualrating = await RatingAndReview.findById(ratingandreview[i]) ;
            sum=sum+individualrating.rating;
        }
        let avg = (sum/ratingandreview.size);
        return res.status(200).json({
            success:true,
            message:"avgerge calculated successfully",
            average:avg
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:"not able to calculate the avgerge rating"
        })
    }
}

exports.getAllRating = async (req,res)=>{
    try{
        const allReview = await RatingAndReview.find({}).sort({rating:"desc"})
                                                .populate({
                                                    path:"user",
                                                    select:"firstName lastName email image",
                                                })
                                                .populate({
                                                    path:"course",
                                                    select:"courseName"
                                                })
                                                .exec();
        return res.status(200).json({
            success:true,
            message:"fetched all the rating successfully",
            data: allReview,
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:"not able to fetch all the rating"
        })
    }
}