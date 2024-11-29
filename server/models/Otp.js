const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");

const Otpschema = mongoose.Schema({
        email:{
            type:String,
            required:true
        },
        datecreated:{
            type:Date,
            default:Date.now(),
            expires:5*60*60*1000
        },
        otp:{
            type:Number,
            required:true
        }

})

async function sendVerificationMail(email,otp){
    try{
        const mailResponse = await mailSender(email,"verification mail from goona make it",otp);
        console.log("mail has been sent successfully",mailResponse);
    }catch(error){
        console.log("error while sending mail",error)
    }
}

Otpschema.pre("save",async function(next){
    await sendVerificationMail(this.email,this.otp);
    next();
})

module.exports = mongoose.model("Otp",Otpschema);