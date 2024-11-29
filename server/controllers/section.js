const Section = require("../models/Section");
const Course = require("../models/Course");
const SubSection = require("../models/Subsection")

exports.createSection = async (req,res)=>{
    try{
        const {sectionName,courseId} = req.body;
        if(!sectionName || !courseId){
            res.status(404).json({
                success:false,
                message:"send the name of section and course Id properly"
            })
        }
        console.log(courseId,"courseid");
        console.log(sectionName,"sectionName");
        const newSection = await Section.create({sectionName:sectionName});
        const courseUpdate = await Course.findByIdAndUpdate(courseId,{$push:{courseContent:newSection._id}},{new:true}).populate("courseContent").populate({
            path:"courseContent",
            populate:{
                path:"subsection"
            }
        });
       
        console.log(courseUpdate);
        res.status(200).json({
            success:true,
            message:"section has been created successfully",
            courseUpdate
        })
    }catch(error){
        res.status(500).json({
            success:false,
            message:"not able to create section"
        })
    }
}

exports.updateSection = async (req,res)=>{
    try{
        const {sectionName,sectionId,courseId} = req.body;
        if(!sectionName || !sectionId || !courseId){
            res.status(404).json({
                success:false,
                message:"send the name of section and section Id properly"
            })
        }
        console.log(sectionName);
        console.log(sectionId);
        console.log(courseId);

        const updatesection = await Section.findByIdAndUpdate(sectionId,{sectionName},{new:true});
        console.log("updated section",updatesection);

        const course = await Course.findById(courseId).populate({
            path:"courseContent",
            populate:{
                path:"subsection"
            },
        }).exec();
        console.log(course);

        return res.status(200).json({
            success:true,
            message:"section updated successfully",
            data:course
        })

    }catch(error){
        res.status(500).json({
            success:false,
            message:"not able to update section"
        })
    }
}

exports.deleteSection = async (req,res)=>{
    try {
        const { sectionId, courseId } = req.body;
        await Course.findByIdAndUpdate(courseId, {
          $pull: {
            courseContent: sectionId,
          },
        });
        const section = await Section.findById(sectionId);
        console.log(sectionId, courseId);
        if (!section) {
          return res.status(404).json({
            success: false,
            message: "Section not found",
          });
        }
    
        await SubSection.deleteMany({ _id: { $in: section.subSection } });
    
        await Section.findByIdAndDelete(sectionId);
    
        const course = await Course.findById(courseId)
          .populate({
            path: "courseContent",
            populate: {
              path: "subsection",
            },
          })
          .exec();
    
        res.status(200).json({
          success: true,
          message: "Section deleted",
          data: course,
        });
      } catch (error) {
        console.error("Error deleting section:", error);
        res.status(500).json({
          success: false,
          message: "Internal server error",
          error: error.message,
        });
      }
}