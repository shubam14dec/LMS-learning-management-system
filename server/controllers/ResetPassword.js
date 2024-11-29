const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

exports.ResetPasswordToken = async (req,res)=>{
    try{
        const email = req.body.email;
        const user = await User.findOne({email});
        if(!user){
            return res.status(404).json({
                success:false,
                message:"your email is not registered"
            })
        }
        const token = crypto.randomBytes(20).toString("hex");
        
        const updatedDetails = await User.findOneAndUpdate(
                                                {email:email},
                                                {
                                                    token:token,
                                                    resetPasswordExpires: Date.now()+5*60*1000,
                                                },
                                                {new:true});
        const url = `https://localhost:3000/update-password/${token}`;
        await mailSender(email,"Password Reset Link",`Password reset link ${url}`);
        return res.status(200).json({
            success:true,
            message:"Email sent successfully , plz check ur email"
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:"Something went wrong while sending reset mail"
        })
    }
}

exports.ResetPassword = async (req,res)=>{
    try{
        const {password,confirmpassword,token} = req.body;
        console.log(password);
        console.log(confirmpassword);
        console.log(token);
        if(password !== confirmpassword){
            return res.json({
                success:false,
                message:"password not matching"
            })
        }
        const user = await User.findOne({token:token});
        console.log(user);
        if(!user){
            return res.json({
                success:false,
                message:"token is invalid"
            })
        }
        console.log("first")
        if(user.resetPasswordExpires < Date.now()){
            return res.json({
                success:false,
                message:"token has expired , regenerate the token"
            })
        }
        console.log("first");
        const hashedPassword = await bcrypt.hash(password,10);
        console.log(hashedPassword)
        const response = await User.findOneAndUpdate({token:token},{password:hashedPassword},{new:true});
        console.log(response);
        return res.status(200).json({
            success:true,
            message:"reset password successfully"
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:"Something went wrong while reseting the password"
        })
    }
}