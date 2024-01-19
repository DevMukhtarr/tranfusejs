import { Router } from "express";
import { verifyToken } from "../middlewares/auth.js";
import { 
    editProfile, getProfile, 
    } from "../controllers/profilecontroller.js";
const router = Router();

router.route("/edit-profile").post(verifyToken, editProfile)
router.route("/profile").get(verifyToken, getProfile)

export default router;