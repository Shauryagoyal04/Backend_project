import {Router} from 'express';
import { changeCurrentPassword, getCurrentUser, getUserChannelProfile, getWatchHistory, loginUser, logoutUser, refreshAccessToken, registerUser, updateAccountDetails, updateAvatar, updateuserCoverImage } from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { get } from 'mongoose';


const router = Router();


router.route("/register").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 }
    ]),
    registerUser
)

router.route("/login").post(loginUser)

// secure route
router.route("/logout").post(verifyJWT , logoutUser);
router.route("/refresh-Token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT,changeCurrentPassword)
router.route("/update-avatar").post(verifyJWT,upload.single("avatar"), updateAvatar);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-account").patch(verifyJWT,updateAccountDetails);
router.route("/update-cover-image").post(verifyJWT, upload.single("coverImage"),updateuserCoverImage);
router.route("/c/:username").get(verifyJWT, getUserChannelProfile);
router.route("/history").get(verifyJWT,getWatchHistory);

export default router;