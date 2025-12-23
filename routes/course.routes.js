import { Router } from "express";
import {isLoggedIn} from "../middlewares/auth.middleware.js"
import
{getAllCoures,
getLecturesByCourseId,    
} from "../controllers/course.controller.js"

const router = new Router();

router.route("/").get(getAllCoures);
router.route("/:id").get(isLoggedIn,getLecturesByCourseId);

export default router;