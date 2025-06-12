import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/apiError.js';
import {User} from '../models/user.model.js';
import {uploadToCloudinary} from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';

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


export {registerUser};