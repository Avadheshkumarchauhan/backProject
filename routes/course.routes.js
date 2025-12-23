import { Router } from "express";
import
{getAllCoures,
getLecturesByCourseId,    
} from "../controllers/course.controller.js"

const router = new Router();

router.route("/").get(getAllCoures);
router.route("/:id").get(getLecturesByCourseId);

export default router;