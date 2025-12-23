import { config } from 'dotenv';
import ApiError from '../utils/error.util.js';
import {User} from "../models/user.model.js"
import { destroy, uploadOnCloudinary } from '../utils/cloudinary.js';
import bcrypt from 'bcryptjs';
import crypto from "crypto";
import sendEmail from '../utils/sendEmail.js';


config({
    quiet: true,
    path:"./.env"
})


const option = {
   // maxAge: 2*60*60*1000*24,
    httpOnly:true,
    secure:false
}

const register = async (req,res ,next) =>{
    try {
        
        const {fullName,email,password} = req.body;    
        if(!fullName ||!email ||!password){
            return next(new ApiError('All fields are required',400));
        }
        const userExists = await User.findOne({email});
        if(userExists){
            return next(new ApiError("Email already exists ",400));
        }
    
         const avatarLocalpath = req.file.path;
       
    
        if(!avatarLocalpath){
            throw new ApiError(400, "Avatar file is missing")
        }
        const avatar = await uploadOnCloudinary(avatarLocalpath);
    
        if (!avatar.url) {
            throw new ApiError(400, "Error while uploading on avatar ")
        }
        const user =await User.create({
            fullName, email,password,avatar:
            {
                public_id:email,
                secure_url:avatar.url
            }
        });
        if (!user) {
            return next(new ApiError("User registation failed , please try again",400));
        }
        await user.save({validateBeforeSave:false});
        const token = user.generateToken();
    
        user.password = undefined;
    
        
        //res.cookie("token",token,option)
        return res.status(200).json({
            success:true,
            message: "User register successfully ",
            user
        })
    } catch (error) {
         return next(new ApiError(error.message,500));
        
    }
}
const login = async (req,res, next) =>{
   try {
        const {email,password} = req.body;
        if(!email ||!password){
            return next(new ApiError("All fiels are required" , 400));
        }
        const user =await User.findOne({email}).select("+password");
        
        
    
        if (!(user && (await bcrypt.compare(password , user.password)))) {
            return next(new ApiError("Email and password does not match", 400));
        }
        const token = user.generateToken();
               
        user.password= undefined;
        
        return res.status(200)
        .cookie("token",token,option)
        .json({
            success:true,
            message:"User login successfully",
            user
        });
   } catch (error) {
        return next(new ApiError(error.message,500));
   }

}
const logout = async (req,res) =>{


  try 
    {
     return res.status(200).
      clearCookie("token",option)
      json({
          success:true,
          message:"User logged out successfully"
      });
    } 
    catch (error) {
         return next(new ApiError(error.message,500));
    
    }
}
const getProfile = async (req,res,next) =>{
  try {

      const userId= req.user._id;
     
      
      const user = await User.findById(userId);
      
     return res.status(200)
      .json({
        success:true,
        message:"Fetch data successfully",
        user
      });
  } catch (error) {
    return next(new ApiError("Failed to fetch profile",500));
  }
}

const forgotPassword = async (req, res) => {
    
        const {email} = req.body;
        if(!email){
            return next(new ApiError("Email is required ",400))
        }
        const user = await User.findOne({email});

        if(!user){
            return next(new ApiError("Email not register ",400));
        }

        const resetToken = user.generatePasswordResetToken();

        await user.save({validateBeforeSave: false});

        const resetPasswordUrl = `${process.env.FRONTEND_UR}/reset_password/${resetToken}`;

       // console.log(resetPasswordUrl);
        
        const subject = "Reset password ";
        const message = `You con reset password by clicking <a href=${resetPasswordUrl} target ="_blank" >Reset your password </a>\nIf the above link does not work for reason then copy paste  this link new tab ${resetPasswordUrl}.\n  If you have not requested this , kindly ignore .`
        try {
        await sendEmail(email, subject, message);

       return res.status(200)
        .json({
            success:true,
            message:`Reset password token has been send to ${email} successfully`
        })
        
    } catch (error) {
        user.forgotPasswordExpiry = undefined;
        user.forgotPasswordToken = undefined;
        await user.save({validateBeforeSave:false});
        return next(new ApiError(error.message,500))
    }
}
const resetPassword = async (req,res,next) => {
    try {
        const {resetToken} = req.params;

        const {password} = req.body;

        const forgotPasswordToken = crypto
                .createHash("sha256")
                .update(resetToken)
                .digest("hex");

        const user = await User.findOne({
            forgotPasswordToken,
            forgotPasswordExpiry:{$gt:Date.now()}
        });

        if(!user){
            return next(new ApiError("Token is invalid or expired, please try again.",400));
        }
        user.password=password;
        user.forgotPasswordExpiry = undefined;
        user.forgotPasswordToken = undefined;
        await user.save({validateBeforeSave:false});

        return res.status(200)
        .json({
            success:true,
            message:"Password changed successfully "
        });

    } catch (error) {
        return next(new ApiError(error.message,500));
    }
}
const chagePassword = async(req, res,next) =>{
    try {
        const {oldPassword,newPassword} = req.body;

        if(!oldPassword || !newPassword){
            return next(new ApiError("All fields are required ",400));
        }
        const user = await User.findById(req.user?._id).select("+pssword");
        if(!user){
            return next(new ApiError("User does nit exist ",400));

        }
        const isPasswordValid =user.comparePassword(oldPassword);

        if(!isPasswordValid){
            return next(new ApiError("Invalid old password "));
        }
        user.password= newPassword;
        user.save({validateBeforeSave:false});
        user.password= undefined

        return res.status(200).json({
            success:true,
            message: "Password changed successfully"
        })
        
    } catch (error) {
        return next(new ApiError(error.message,500));
    }
}
const updateUser = async(req,res,next) =>{
    try 
    {
        const {fullName} = req.body;
    
        const user = await User.findById(req.user?._id);
        if(req.fullName){
        user.fullName= fullName;
        }
        if(req.file)
        {
            const avatar = uploadOnCloudinary(req.file.path)
            if(!avatar){
                return next(new ApiError("Error while uploading  on cloudinary"))
            }
            destroy(user.avatar.public_id);
            user.avatar.public_id= avatar.public_id;
            user.avatar.secure_url = avatar.secure_url;
        }  

        await user.save({validateBeforeSave:false});
        return res.status(200).json({
            success:true,
            message:"User datails updated successfully "
        })
       
    } 
    catch (error) {
        return next(new ApiError(error.message,500));
    }
}

export {
    register,
    login,
    logout,
    getProfile,
    forgotPassword,
    resetPassword,
    chagePassword,
    updateUser,
}