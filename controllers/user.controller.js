import ApiError from '../utils/error.util.js';
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import bcrypt from 'bcryptjs';


const option = {
   // maxAge: 2*60*60*1000*24,
    httpOnly:true,
    secure:false
}

const register = async (req,res ,next) =>{
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
    await user.save();
    const token = user.generateToken();

    user.password = undefined;

    
    //res.cookie("token",token,option)
    res.status(200).json({
        success:true,
        message: "User register successfully ",
        user
    })
}
const login = async (req,res, next) =>{
   try {
     const {email,password} = req.body;
     if(!email ||!password){
         return next(new ApiError("All fiels are required" , 400));
     }
     const user =await User.findOne({email}).select("+password");
     console.log(user.password);
     
 
     if (!user|| !(await bcrypt.compare(password , user.password))) {
         return next(new ApiError("Email and password does not match", 400));
     }
     const token = user.generateToken();
     //console.log(token);
     
     user.password= undefined;
     res.cookie("token",token,option)
     res.status(200)
     .json({
        success:true,
        message:"User login successfully",
        user
     })
   } catch (error) {
        return next(new ApiError(e.message,500));
   }

}
const logout = async (req,res) =>{
    res.clearCookie("token",null,option)
    res.status(200).
    json({
        success:true,
        message:"User logged out successfully"
    })
}
const getProfile = async (req,res,next) =>{
  try {
      const userId= req.user._id;
     // console.log(userId);
      
      const user = await User.findById(userId);
     // console.log(user._id);
      
      res.status(200)
      .json({
        success:true,
        message:"Fetch data successfully",
        user
      })
  } catch (error) {
    return next(new ApiError("Failed to fetch profile",500));
  }
}


export {
    register,
    login,
    logout,
    getProfile
}