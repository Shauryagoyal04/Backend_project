import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/apiError.js';
import {User} from '../models/user.model.js';
import {deletefromCloudinary, uploadToCloudinary} from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';


const generateAccessandRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(503, "Error generating access and refresh tokens");
    }
}



const registerUser = asyncHandler(async (req, res) => {
    // get user detail from frontend
    // validata all data 
    // check if user already exists
    // check for avatar and image 
    // upload to cloudinary , check if upload is successful
    // create user in database  
    // remove password and refresh token from response
    // check if user is created successfully
    // send response to frontend

    const {fullName, email, password, username} = req.body;
   // console.log("Register User Request Body", req.body);
   // console.log("Register User Request Files", req.files);

    if(fullName === "" || email === "" || password === "" || username === "") {
        throw new ApiError(400, "Please fill all the fields");
    }
    if(!email.includes("@")) {
        throw new ApiError(401, "Please enter a valid email");
    }

    const existedUser = await User.findOne({
        $or : [{username}, {email}]
    })
    if(existedUser) {
        throw new ApiError(409, "User already exists with this username or email");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    let coverImageLocalPath ;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if(!avatarLocalPath) {
        throw new ApiError(400, "Please upload avatar");
    }

    const avatar = await uploadToCloudinary(avatarLocalPath);
    
    const coverImage = await uploadToCloudinary(coverImageLocalPath);
    if(!avatar) {
        throw new ApiError(500, "Error uploading avatar to cloudinary");
    }

    const newUser = await User.create({
        fullName,
        email,
        password,
        username: username.toLowerCase(),
        avatar: avatar.url,
        coverImage: coverImage ? coverImage.url : ""
    })

    const createdUser = await User.findById(newUser._id).select("-password -refreshToken")

    if(!createdUser) {
        throw new ApiError(500, "Error registering the user");
    }

    return res.status(201).json(new ApiResponse(201, createdUser, "User registered successfully"));
})

const loginUser = asyncHandler(async (req, res) => {
    //get detail from frontend
    // validate data
    // check for the user in database
    // check if password is correct
    // generate access token and refresh token
    // send cookies
    // send response to frontend removing password and refresh token

    const {email, username ,password} = req.body;
    console.log(email)
    if(!email && !username) {
        throw new ApiError(400, "Please provide email or username");
    }

    const user = await User.findOne({
        $or : [{username}, {email}]
    })
    if(!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid) {
        throw new ApiError(405, "InCorrect password");
    }

    const {accessToken , refreshToken} = await generateAccessandRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure:true,
    }

    return res.status(200).cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, {user : loggedInUser , accessToken , refreshToken}, "User logged in successfully"));


})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true,
        }
    )

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res.status(200).clearCookie("accessToken", options)
        .clearCookie("refreshToken",options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
})


const refreshAccessToken = asyncHandler(async (req, res) => {

    const incomingrefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingrefreshToken) {
        throw new ApiError(401, "Please login again");
    }

    try {
        const decodedToken = jwt.verify(incomingrefreshToken, process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
    
        if(!user) {
            throw new ApiError(401, "Invalid refresh token, please login again");
        }
    
        if(user.refreshToken !== incomingrefreshToken) {
            throw new ApiError(401, "Invalid refresh token, please login again");
        }
    
        const options = {
            httpOnly: true,
            secure: true,
        }
    
        const {accessToken , newrefreshToken} = await generateAccessandRefreshTokens(user._id);
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newrefreshToken, options)
            .json(
                new ApiResponse(
                    200, {accessToken, refreshToken: newrefreshToken},
                    "Access token refreshed successfully"
                )
            );
    
    } catch (error) {
        throw new ApiError(401, error?.message ||  "Invalid refresh token, please login again");
        
    }

})


const changeCurrentPassword = asyncHandler(async (req, res) => { 
    const {oldPassword, newPassword} = req.body;

    const user = await User.findById(req.user._id);

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if(!isPasswordCorrect) {
        throw new ApiError(400, "Old password is incorrect");
    }

    user.password = newPassword;
    await user.save({validateBeforeSave: false});

    return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, req.user, "Current user fetched successfully"));
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const {fullName, email} = req.body;

    if(!fullName || !email ) {
        throw new ApiError(400, "Please fill all the fields");
    }

    if(!email.includes("@")) {
        throw new ApiError(401, "Please enter a valid email");
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email
            }
        },
        {
            new: true,
        }
    ).select("-password -refreshToken");

    return res.status(200).json(new ApiResponse(200, user, "User details updated successfully"));
})

const updateAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar file missing");
    }
    const user = await User.findById(req.user?._id).select("avatar");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const oldAvatarUrl = user.avatar;

    const avatar = await uploadToCloudinary(avatarLocalPath);

    if(!avatar.url) {
        throw new ApiError(500, "Error uploading avatar to cloudinary");
    }

    user.avatar = avatar.url;
    await user.save({ validateBeforeSave: false });

    if(oldAvatarUrl && oldAvatarUrl !== avatar.url) {
        // Optionally delete the old avatar from cloudinary
         await deletefromCloudinary(oldAvatarUrl);
    }

    const updatedUser = user.toObject();
    delete updatedUser.password;
    delete updatedUser.refreshToken;

    return res.status(200).json(new ApiResponse(200, updatedUser, "Avatar updated successfully"));
    


})

const updateuserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;

    if(!coverImageLocalPath) {
        throw new ApiError(400, "CoverImage file missing");
    }
    const coverImage = await uploadToCloudinary(coverImageLocalPath);

    if(!coverImage.url) {
        throw new ApiError(500, "Error uploading coverImage to cloudinary");
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImager: coverImage.url
            }
        },
        {
            new: true,
        }
    ).select("-password -refreshToken");
    return res.status(200).json(new ApiResponse(200, user, "Avatar updated successfully"));
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateAvatar,
    updateuserCoverImage
};