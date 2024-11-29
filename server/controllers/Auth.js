const User = require("../models/User")
const Otpgenerator = require("otp-generator");
const Otp = require("../models/Otp")
const bcrypt = require("bcrypt");
const Profile = require("../models/Profile");
const jwt = require("jsonwebtoken");
const {passwordUpdated} = require("../mail/templates/passwordUpdate")
const mailSender = require("../utils/mailSender")
// otp generator
exports.sendOtp = async (req,res)=>{
    try{
        const {email} = req.body;
        const checkuserpresent =await User.findOne({email});
        if(checkuserpresent){
            return res.status(404).json({
                success:false,
                message:"user already exists"
            })
        }
        const otp = Otpgenerator.generate(6,{
            lowerCaseAlphabets:false,
            upperCaseAlphabets:false,
            specialChars:false
        })
        console.log("Otp generated successfully",otp)
        const response = await Otp.create({
            email:email,
            otp:otp
        })
        console.log(response);
        res.status(200).json({
            success:true,
            message:"otp saved in db successfully"
        })

    }catch(error){
        res.status(500).json({
            success:false,
            message:"error in occcured in otp generation"
        })
    }
}

exports.signup = async (req,res)=>{
    try{
        const {
            firstName,
            lastName,
            email,
            password,
            confirmpassword,
            accountType,
            contactNumber,
            otp
        } =req.body;

       console.log(firstName);
       console.log(lastName);
       console.log(email);
       console.log(password);
       console.log(confirmpassword);
       console.log(accountType);
       console.log(otp);

        if(!firstName || !lastName || !email || !password || !confirmpassword || !otp){
            return res.status(404).json({
                success:false,
                message:"enter all the details properlyy"
            })
        }
        console.log("first");
      
        if(password!==confirmpassword){
            return res.status(404).json({
                success:false,
                message:"password and confirmpassword does not match"
            })
        }
        const userExists = await User.findOne({email});
        if(userExists){  
            return res.status(400).json({ 
                success:true,
                message:"user already exist"
            })
        }

        const recentOtp =await Otp.findOne({email:email});
        console.log(recentOtp); 

        if(recentOtp.otp != otp){
            return res.status(404).json({
                success:false,
                message:"entererd otp is invalid"
            })  
        }     
       console.log("first....");

        const hashedPassword = await bcrypt.hash(password,10);
       console.log("first....");
          
        let profileDetails = await Profile.create({
            gender:null,
            dateOfBirth:null,
            about:null,
            contactNumber:null
        })
        
        console.log("first....");

        const user = await User.create({ 
            firstName:firstName,
            lastName:lastName,
            email:email,  
            password:hashedPassword,
            accountType:accountType,
            additionalDetails:profileDetails._id,
            image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
        })
        
        console.log("first....");
        console.log(user); 

        return res.status(200).json({
            success: true,
            message: "User registered successfully",
            user,
          })

    }catch(error){
        return res.status(500).json({
            success:false,
            
            message:"user cannot be registered , plz try again"
        })
    }
}

exports.login = async (req,res)=>{
    try{
        const {email,password}=req.body;    
        if(!email || !password){
            return res.status(404).json({
                success:false,
                message:"enter full details"
            })
        }

        const user = await User.findOne({email}).populate("additionalDetails").exec();;
        if(!user){
            return res.status(404).json({
                success:false,
                message:"user not exist plz signup first"
            })
        }
       if(await bcrypt.compare(password,user.password)){
        const payload ={
            email:user.email,
            id:user._id,
            accountType:user.accountType
        }
        const token = jwt.sign(payload,process.env.JWT_SECRET,{
            expiresIn:"2h",
        })
        user.token=token;
        user.password=undefined;
        const options = {
            expires:new Date(Date.now()+ 3*24*60*60*1000),
            httpOnly:true   
        }
        console.log(user)
        res.cookie("token",token,options).json({
            success:true,
            user,
            token,
            message:"logged in successfully"
        })
        
       }else{
        return res.status(404).json({
            success:false,
            message:"password incorrect"
        })
       }

    }catch(error){
        res.status(500).json({
            success:false,
            message:"not able to login"
        })
    }
}


// Controller for Changing Password
exports.changePassword = async (req, res) => {
	try {
		// Get user data from req.user
		const userDetails = await User.findById(req.user.id);

		// Get old password, new password, and confirm new password from req.body
		const { oldPassword, newPassword, confirmNewPassword } = req.body;

		// Validate old password
        console.log(userDetails);
        
		const isPasswordMatch = await bcrypt.compare(
			oldPassword,
			userDetails.password
		);
       
		if (!isPasswordMatch) {
			// If old password does not match, return a 401 (Unauthorized) error
			return res
				.status(401)
				.json({ success: false, message: "The password is incorrect" });
		}

		// Match new password and confirm new password
		if (newPassword !== confirmNewPassword) {
			// If new password and confirm new password do not match, return a 400 (Bad Request) error
			return res.status(400).json({
				success: false,
				message: "The password and confirm password does not match",
			});
		}

		// Update password
		const encryptedPassword = await bcrypt.hash(newPassword, 10);
		const updatedUserDetails = await User.findByIdAndUpdate(
			req.user.id,
			{ password: encryptedPassword },
			{ new: true }
		);

		// Send notification email
		try {
			const emailResponse = await mailSender(
				updatedUserDetails.email,
                "password changed for gonna make it",
				passwordUpdated(
					updatedUserDetails.email,
					`Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
				)
			);
			console.log("Email sent successfully:", emailResponse.response);
		} catch (error) {
			// If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
			console.error("Error occurred while sending email:", error);
			return res.status(500).json({
				success: false,
				message: "Error occurred while sending email",
				error: error.message,
			});
		}

		// Return success response
		return res
			.status(200)
			.json({ success: true, message: "Password updated successfully" });
	} catch (error) {
		// If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
		console.error("Error occurred while updating password:", error);
		return res.status(500).json({
			success: false,
			message: "Error occurred while updating password",
			error: error.message,
		});
	}
};