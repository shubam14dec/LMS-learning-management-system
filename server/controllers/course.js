const Course = require("../models/Course");
const Category = require("../models/Category");
const User = require("../models/User");
const Subsection = require("../models/Subsection");
const Section = require("../models/Section");
const {uploadImageToCloudinary} = require("../utils/imageUploader");
const { default: mongoose } = require("mongoose");

exports.createCourse = async (req,res)=>{
    try{
        const{courseName,courseDescription,whatyouwilllearn,price,tags,category}=req.body;
        const thumbnail = req.files.thumbnailImage;
       
        if(!courseName || !courseDescription || !whatyouwilllearn || !price || !tags || !thumbnail){
           return res.status(404).json({
                success:false,
                message:"enter all the details"
            })   
        }
    const userId = req.user.id;
    console.log(userId); 
    const instructorDetails = await User.findOne({_id:userId});
    if(!instructorDetails){
        res.status(404).json({
            success:false,
            message:"Instructor details not found"
        })
    }
    console.log(instructorDetails)
    const CategoryDetails = await Category.findById(category);
    if(!CategoryDetails){
        res.status(404).json({
            success:false,
            message:"tag not found"
        })
    }
    console.log("printing tag details");
    console.log(CategoryDetails)
    const thumbnailImage = await uploadImageToCloudinary(thumbnail,process.env.FOLDER_NAME);
    console.log(thumbnailImage);
    
     
    const newCourse = await Course.create({
        courseName:courseName,
        courseDescription:courseDescription,
        whatyouwilllearn:whatyouwilllearn,
        instructor:instructorDetails._id,
        price:price,
        category:CategoryDetails._id,
        thumbnail:thumbnailImage.secure_url,
        tags:tags
    }) 
    console.log(newCourse);
    const response = await User.findByIdAndUpdate({_id:userId},{$push:{courses:newCourse._id}},{new:true})
    await Category.findByIdAndUpdate(
      { _id: category },
      {
        $push: {
          course: newCourse._id,
        },
      },
      { new: true }
    );

        return res.status(200).json({
            success:true,
            message:"course created successfully",
            newCourse
        })

    }catch(error){
        return res.status(500).json({
            success:false,
            message:"not able to create course"
        })
    }
}

exports.getAllCourses = async (req,res)=>{
    try{
        const allCourses = await Course.find({},{courseName:true,
                                                price:true,
                                                thumbnail:true,
                                                instructor:true,
                                                ratingAndReview:true,
                                                studentEnrolled:true}).populate("instructor").exec();
        return res.status(200).json({
            success:true,
            message:"fetched all the courses successfully",
            data: allCourses
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:"not able to get all the courses"
        })
    }
}

exports.getCourseDetails =async(req,res)=>{
    try{
        const {courseId} = req.body;
        const courseDetails = await Course.findById({_id:courseId})
                                                    .populate({
                                                        path:"instructor",
                                                        populate:{
                                                            path:"additionalDetails"
                                                        }
                                                    })
                                                    .populate("category")
                                                    .populate("ratingAndReview")
                                                    .populate({
                                                        path:"courseContent",
                                                        populate:{
                                                            path:"subsection"
                                                        }
                                                    })
                                                    .exec()
    if(!courseDetails){
        res.status(404).json({
            success:false,
            message:`could not find the course with courseId ${courseId}`
        })
    }
    return res.status(200).json({
        success:true,
        message:"course content fetched successfully",
        courseDetails
    })

    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"error in getting the course details"
        })
    }
}

exports.getFullCourseDetails = async (req, res) => {
    try {
      const { courseId } = req.body
      const userId = req.user.id
      const courseDetails = await Course.findOne({
        _id: courseId,
      })
        .populate({
          path: "instructor",
          populate: {
            path: "additionalDetails",
          },
        })
        .populate("category")
        .populate({
          path: "courseContent",
          populate: {
            path: "subsection",
          },
        })
        .exec()
  
      // let courseProgressCount = await CourseProgress.findOne({
      //   courseID: courseId,
      //   userId: userId,
      // })
  
      // console.log("courseProgressCount : ", courseProgressCount)
  
      if (!courseDetails) {
        return res.status(400).json({
          success: false,
          message: `Could not find course with id: ${courseId}`,
        })
      }
  
  
      // let totalDurationInSeconds = 0
      // courseDetails.courseContent.forEach((content) => {
      //   content.subSection.forEach((subSection) => {
      //     const timeDurationInSeconds = parseInt(subSection.timeDuration)
      //     totalDurationInSeconds += timeDurationInSeconds
      //   })
      // })
  
      // const totalDuration = convertSecondsToDuration(totalDurationInSeconds)
  
      return res.status(200).json({
        success: true,
        data: {
          courseDetails,
          // totalDuration,
          // completedVideos: courseProgressCount?.completedVideos
          //   ? courseProgressCount?.completedVideos
          //   : [],
        },
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }

  exports.editCourse = async (req, res) => {
    try {
      const { courseId } = req.body
      const updates = req.body
      const course = await Course.findById(courseId)
  
      if (!course) {
        return res.status(404).json({ error: "Course not found" })
      }
  
      // If Thumbnail Image is found, update it
      if (req.files) {
        console.log("thumbnail update")
        const thumbnail = req.files.thumbnailImage
        const thumbnailImage = await uploadImageToCloudinary(
          thumbnail,
          process.env.FOLDER_NAME
        )
        course.thumbnail = thumbnailImage.secure_url
      }
  
      // Update only the fields that are present in the request body
      for (const key in updates) {
        if (updates.hasOwnProperty(key)) {
          if (key === "tag" || key === "instructions") {
            course[key] = JSON.parse(updates[key])
          } else {
            course[key] = updates[key]
          }
        }
      }
  
      await course.save()
  
      const updatedCourse = await Course.findOne({
        _id: courseId,
      })
        .populate({
          path: "instructor",
          populate: {
            path: "additionalDetails",
          },
        })
        .populate("category")
        .populate({
          path: "courseContent",
          populate: {
            path: "subsection",
          },
        })
        .exec()
  
      res.json({
        success: true,
        message: "Course updated successfully",
        data: updatedCourse,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
    }
  }

  exports.getInstructorCourses = async (req, res) => {
    try {
      // Get the instructor ID from the authenticated user or request body
      console.log("in get instructor courses controller")
      const instructorId = req.user.id 
   
      // Find all courses belonging to the instructor
      const instructorCourses = await Course.find({
        instructor: instructorId,
      }).sort({ createdAt: -1 }) 
        .populate({
        path: "courseContent",
        populate: {
          path: "subsection",
        },
      })
      .exec();
  
      // Return the instructor's courses
      res.status(200).json({
        success: true,
        data: instructorCourses,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({
        success: false,
        message: "Failed to retrieve instructor courses",
        error: error.message,
      })
    }
  }
  exports.deleteCourse = async (req, res) => {
    try {
      const { courseId } = req.body
      console.log("in delete course section")
      // Find the course
      const course = await Course.findById(courseId)
      if (!course) {
        return res.status(404).json({ message: "Course not found" })
      }
  
      // Unenroll students from the course
      const studentEnrolled = course.studentEnrolled
      for (const studentId of studentEnrolled) {
        await User.findByIdAndUpdate(studentId, {
          $pull: { courses: courseId },
        })
      }
  
      // Delete sections and sub-sections
      const courseSections = course.courseContent
      for (const sectionId of courseSections) {
        // Delete sub-sections of the section
        const section = await Section.findById(sectionId)
        if (section) {
          const subsections = section.subsection
          for (const subsectionId of subsections) {
            await Subsection.findByIdAndDelete(subsectionId)
          }
        }
  
        // Delete the section
        await Section.findByIdAndDelete(sectionId)
      }
  
      // Delete the course
      await Course.findByIdAndDelete(courseId)
  
      return res.status(200).json({
        success: true,
        message: "Course deleted successfully",
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      })
    }
  }