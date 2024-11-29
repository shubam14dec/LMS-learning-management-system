const Subsection = require("../models/Subsection");
const Section = require("../models/Section");
const {uploadImageToCloudinary} =require("../utils/imageUploader");

exports.createSubSection = async(req,res)=>{
    try{
        const {sectionId,title,description} = req.body;
        const video = req.files.video;
      
        if(!sectionId || !title  || !description || !video){
            return res.status(404).json({
                success:false,
                message:"send the complete data to create a subsection"
            })
        }
        console.log("11")
        const videoUrl = await uploadImageToCloudinary(video,process.env.FOLDER_NAME);
        const newSubsection = await Subsection.create({
            title:title,
            timeDuration:videoUrl.duration,
            description:description,
            videoUrl:videoUrl.secure_url
        })
        console.log("11")
        const updatedSection = await Section.findByIdAndUpdate(sectionId,{$push:{subsection:newSubsection._id}},{new:true}).populate("subsection");
        console.log("22")
        return res.status(200).json({
            success:true,
            message:"subsection created successfully and added to its section",
            data: updatedSection
        })
    }catch(error){
        res.status(500).json({
            success:false,
            message:"not able to create subSection"
        })
    }
}


exports.updateSubSection = async (req, res) => {
    try {
      const { sectionId,subSectionId, title, description } = req.body
      const subSection = await Subsection.findById(subSectionId)
  
      if (!subSection) {
        return res.status(404).json({
          success: false,
          message: "SubSection not found",
        })
      }
  
      if (title !== undefined) {
        subSection.title = title
      }
  
      if (description !== undefined) {
        subSection.description = description
      }
      if (req.files && req.files.video !== undefined) {
        const video = req.files.video
        const uploadDetails = await uploadImageToCloudinary(
          video,
          process.env.FOLDER_NAME
        )
        subSection.videoUrl = uploadDetails.secure_url
        subSection.timeDuration = `${uploadDetails.duration}`
      }
  
      await subSection.save()
  
      const updatedSection = await Section.findById(sectionId).populate("subsection")


      return res.json({
        success: true,
        data:updatedSection,
        message: "Section updated successfully",
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "An error occurred while updating the section",
      })
    }
  }
  
  exports.deleteSubSection = async (req, res) => {
    try {
      const { subSectionId, sectionId } = req.body
      await Section.findByIdAndUpdate(
        { _id: sectionId },
        {
          $pull: {
            subsection: subSectionId,
          },
        }
      )
      console.log("subsectionid",subSectionId)
      console.log("sectionid",sectionId)
      const subSection = await Subsection.findByIdAndDelete(subSectionId)
  
      if (!subSection) {
        return res
          .status(404)
          .json({ success: false, message: "SubSection not found" })
      }

      const updatedSection = await Section.findById(sectionId).populate("subsection")
  
      return res.json({
        success: true,
        data:updatedSection,
        message: "SubSection deleted successfully",
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "An error occurred while deleting the SubSection",
      })
    }
  }