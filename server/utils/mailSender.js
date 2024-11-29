const nodemailer = require("nodemailer");

const mailSender = async(email,title,body)=>{
    try{
        let transporter = nodemailer.createTransport({
            host:process.env.MAIL_HOST,
            auth:{
                user:process.env.MAIL_USER,
                pass:process.env.MAIL_PASS
            }
        })
       const info =await transporter.sendMail({
            from:"Gonna make it",
            to:`${email}`,
            subject:`${title}`,
            html:`${body}`
       })

       console.log(info);
       return info;

    } catch(error){
        console.log(error);
    }
    
}

module.exports = mailSender;
