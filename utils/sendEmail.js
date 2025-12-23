 import nodemailer from "nodemailer";

 const sendEmail = async (email, subject, message) =>{

    try {
        const transporter = nodemailer.createTransport({
            host:"smtp.ethereal.email",
            port:587,
            secure:false,
            auth:{
                user:"maddison53@ethereal.email",  //"username",
                pass:"jn7jnAPss4f63QBp6D",  //"password"
            },

        });
        await transporter.sendMail({
            from:"smtp_from_email",
            to:email,
            subject:subject,
            html:message

        });
        
    } catch (error) {
        
        return null;
        
    }
}
export default sendEmail;