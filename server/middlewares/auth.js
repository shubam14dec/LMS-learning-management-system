const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

exports.auth = async (req,res,next)=>{
    try{
        console.log("in auth") 
      const token = req.cookies.token || req.body.token || req.header("Authorization").replace("Bearer ","");
        console.log(token)  
        if(!token){ 
            return res.status(404).json({
                success:false,
                message:"token not found"
            })
        }
      
        try{ 
            const payload = jwt.verify(token,process.env.JWT_SECRET);
            // console.log(payload);
            req.user = payload; 
        }catch(error){
            res.status(404).json({
                success:false,  
                message:"token verificatio issue"
            })
        }
        next(); 
    }catch(error){
        res.status(500).json({
            success:true,
            message:"something went wrong"
        })
    }
}

exports.isStudent = async (req,res,next)=>{
    try{
                console.log("in student middleware") 
                if(req.user.accountType !== "Student"){
                    res.status(404).json({
                        success:false,
                        message:"it is protected for student only"
                    })
                }
                next();

    }catch(error){
        res.status(500).json({
            success:true,
            message:"something went wrong in student route"
        })
    }
}

exports.isAdmin = async (req,res,next)=>{
    try{
                if(req.user.accountType !== "Admin"){
                    res.status(404).json({
                        success:false,
                        message:"it is protected for Admin only"
                    })
                }
                next();

    }catch(error){
        res.status(500).json({
            success:true,
            message:"something went wrong in Admin route"
        })
    }
}

exports.isInstructor = async (req, res, next) => {
    try{
           if(req.user.accountType !== "Instructor") {
               return res.status(401).json({
                   success:false,
                   message:'This is a protected route for Instructor only',
               });
           }
           next();
    }
    catch(error) {
       return res.status(500).json({
           success:false,
           message:'User role cannot be verified, please try again'
       })
    }
   }
