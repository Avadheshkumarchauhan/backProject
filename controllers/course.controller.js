import Course from "../models/course.model.js"
import ApiError from "../utils/error.util.js";

const getAllCoures = async(req,res,next) =>{
   try {
     const courses = await Course.find({}).select("-Lectures");
     if(!courses){
         return next(new ApiError("Course is not exist",400));

    }
    return res.status(200).json({
        success:true,
        message:"All courses ",
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
    })

   } catch (error) {
        return next(new ApiError(error.message,500))
    
   }

}

export {
    getAllCoures,
    getLecturesByCourseId,

}
