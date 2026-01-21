import Course from "../models/course.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import ApiError from "../utils/error.util.js";

const getAllCoures = async(req,res,next) =>{
   try {
     const courses = await Course.find({}).select("-Lectures");
     if(!courses){
         return next(new ApiError("Course is not exist",400));

    }
    return res.status(200).json({
        success:true,
        message:"All courses fetch successfully ",
        courses
    })

   } catch (error) {
        return next(new ApiError(error.message,500))
    
   }

}
const getLecturesByCourseId = async(req,res,next) =>{
     try {
        const {_id} =req.params; 
     const course = await Course.findById(_id);
     if(!course){
         return next(new ApiError("Invalid course id ",400));

    }
    return res.status(200).json({
        success:true,
        message:"Course lectures fetched successfully ",
        lectures:course.lectures
    });

   } catch (error) {
        return next(new ApiError(error.message,500));    
   }
}
const createCourse = async(req, res, next) =>{
    try {
        const {title, description, category, createdBy} = req.body;
        
        if(!title || !description || !category || !createdBy){
            return next(new ApiError("All fields are required",400));  
        }     
        const{path} = req.file;
               
        if (!path) {
             return next(new ApiError("Thumbnail is meassing",400));
        }
        const thumbnail = await uploadOnCloudinary(path);
      
        
        if(!thumbnail.url){
            return next("Error while uploading  thumbnail on cloudinary ",400);  
        }
        const course = await Course.create({
            title, description, category, createdBy,
            thumbnail:{
                public_id:thumbnail.public_id,
                secure_url:thumbnail.url
            },
        });
        if (!course) {
            return next(new ApiError("Course could not be created , please try again ",500));  
        }
        return res.status(200)
        .json({
            success:true,
            message:"Coures created successfully",
            course
        });
    } catch (error) {
        return next(new ApiError(error.message,500)); 
    }
}
const updateCourse = async(req, res, next) =>{
    try {
        const {id} = req.params;
        const course = await Course.findByIdAndUpdate(
            id, 
            {$set:req.body},
            {runValidators:true},
        );
        if (!course) {
             return next(new ApiError("Course with given id does not exist",500));
        }
        return res.status(200)
        .json({
            success:true,
            message:"Course successfully updated " ,
            course,
        })
    } catch (error) {
        return next(new ApiError(error.message,500)); 
    }
}
const removeCourse = async(req, res, next) =>{
    try {
        const{id} = req.params;
        const course = await Course.findByIdAndDelete(id);
          
        
        return res.status(200)
        .json({
            success:true,
            message:"Course deleted successfully ",
            course,
        })
    } catch (error) {
        return next(new ApiError(error.message,500)); 
    }
}
const addLectureToCourseById = async(req, res, next) =>{
    try {
        const {title, description} = req.body;
        const {id} =req.params;
        const localPath = req.file.path;
          if(!title || !description ){
            return next(new ApiError("All fields are required",400));  
        }
        const lectureData ={
            title,
            description,
            lecture:{},
        };

        const course = await Course.findById(id);
        if (!course) {
             return next(new ApiError("Course with given id does not exist",500));
        }  if (!localPath) {
             return next(new ApiError("Thumbnail is meassing",400));
        }
        const lecture =uploadOnCloudinary(localPath);
        if(!lecture.url){
            return next("Error while uploading  thumbnail on cloudinary ",400);  
        }
      lectureData.lecture.public_id = title;
      lectureData.lecture.secure_url = lecture.url;
      course.lectures.push(lectureData);

      course.numbersOfLectures = course.lectures.length;
      await course.save({validateBeforeSave:false});
      return res.status(200)
      .json({
        success:true,
        message:"Lecture successfully added to the coures",
        course
      })
    } catch (error) {
        return next(new ApiError(error.message,500)); 
    }
}
export {
    getAllCoures,
    getLecturesByCourseId,
    createCourse,
    updateCourse,
    removeCourse,
    addLectureToCourseById,
}
