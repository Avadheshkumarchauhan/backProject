import { Router } from "express";
import {authorizedRoles, isLoggedIn} from "../middlewares/auth.middleware.js"
import {upload} from "../middlewares/multer.middleware.js"
import
{addLectureToCourseById,
createCourse,
getAllCoures,
getLecturesByCourseId,
removeCourse,
updateCourse,    
} from "../controllers/course.controller.js"

const router = new Router();

router.route("/")
    .get(getAllCoures)
    .post(isLoggedIn,
    authorizedRoles("ADMIN"),
    upload.single("thumbnail"),
    createCourse);

router.route("/:id")
    .get(isLoggedIn,getLecturesByCourseId)
    .putch(isLoggedIn,authorizedRoles("ADMIN"), updateCourse)
    .delete(isLoggedIn, authorizedRoles("ADMIN"), removeCourse)
    .post(isLoggedIn,authorizedRoles("ADMIN"),upload("lecture"),addLectureToCourseById);

export default router;