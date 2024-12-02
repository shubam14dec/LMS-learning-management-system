const Category = require("../models/Category");

exports.createCategory = async (req,res)=>{
    try{
        const {name,description} = req.body;
        if(!name || !description){
            return res.status(404).json({
                success:false,
                message:"give all the fields correctly"
            })
        }
        const tag = await Category.create({name:name,description:description});
        console.log(tag)

        return res.status(200).json({
            success:true,
            message:"tag created successfully"
        }) 

    }catch(error){
        return res.status(500).json({
            success:false,
            message:"not able to create tags"
        }) 
    }
}

exports.showAllCategories = async (req,res)=>{
    try{
        const alltags = await Category.find({},{name:true,description:true});
        console.log(alltags);
        res.status(200).json({
            success:true,
            message:"All tags fetched successfully",
            alltags
        })

    }catch(error){ 
            return res.status(500).json({
            success:false,
            message:"not able to show all tags"
        })
    }
}

exports.categoryPageDetails = async (req,res)=>{
    try{
        const {categoryId} = req.body;
        console.log("alskdf-",categoryId);
        const selectedCategory = await Category.findById(categoryId).populate("course").populate({
            path:"course",
            populate:{
                path:"instructor"
            }
        }).exec();
        if(!selectedCategory){
            return res.status(404).json({
                success:false,
                message:"data not found"
            }) 
        }
        const differentCategories = await Category.find({
                                     _id:{$ne:categoryId}
                                    })
                                    .populate("courses").exec();
        return res.status(200).json({
            success:true,
            message:"category page fetched successfully",
            selectedCategory,
            differentCategories
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:"not able to fetch category page content"
        })
    }
}