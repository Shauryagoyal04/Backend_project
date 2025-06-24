import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    //const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    const { page = 1, limit = 10, query = "", sortBy = "createdAt", sortType = "desc", userId } = req.query;

    const filter = {
        isPublished: true,
        title: { $regex: query, $options: "i" },
        ...(userId && { owner: userId })
    };

    const sort = { [sortBy]: sortType === "asc" ? 1 : -1 };

    const videos = await Video.find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .populate("owner", "username email");


    const total = await Video.countDocuments(filter);


    res.status(200).json(
        new ApiResponse(200, {
        total,
        page: Number(page),
        limit: Number(limit),
        videos
        }, videos.length === 0 ? "No videos found":"Videos fetched successfully")
    );
})

const publishAVideo = asyncHandler(async (req, res) => {
    //const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    const { title, description } = req.body;
    const videoLocal = req.files?.videoFile?.[0];
    const thumbnailLocal = req.files?.thumbnail?.[0];

    if (!videoLocal || !thumbnailLocal) {
        throw new ApiError(400, "Both video file and thumbnail are required");
    }

    const videoCloudinary = await uploadOnCloudinary(videoLocal.path);
    const thumbnailCloudinary = await uploadOnCloudinary(thumbnailLocal.path);

    if (!videoCloudinary?.url || !thumbnailCloudinary?.url) {
        throw new ApiError(500, "Cloudinary upload failed");
    }

    const newVideo = await Video.create({
        title,
        description,
        videoFile: videoCloudinary.url,
        thumbnail: thumbnailCloudinary.url,
        duration: videoCloudinary.duration || 0,
        owner: req.user._id,
    });

    res.status(201).json(new ApiResponse(201, newVideo, "Video uploaded successfully"));
})

const getVideoById = asyncHandler(async (req, res) => {
    //const { videoId } = req.params
    //TODO: get video by id
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID");

    const video = await Video.findById(videoId).populate("owner", "username email");

    if (!video) throw new ApiError(404, "Video not found");

    res.status(200).json(new ApiResponse(200, video, "Video fetched successfully"));
})

const updateVideo = asyncHandler(async (req, res) => {
    //const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const { videoId } = req.params;
    const { title, description } = req.body;

    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID");

    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video not found");

    if (String(video.owner) !== String(req.user._id)) {
      throw new ApiError(403, "You are not authorized to update this video");
    }

    if (title) video.title = title;
    if (description) video.description = description;

    if (req.file) {
      const newThumb = await uploadOnCloudinary(req.file.path);
      if (newThumb?.url) video.thumbnail = newThumb.url;
    }

    await video.save();

    res.status(200).json(new ApiResponse(200, video, "Video updated successfully"));

})

const deleteVideo = asyncHandler(async (req, res) => {
    //const { videoId } = req.params
    //TODO: delete video
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID");

    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video not found");

    if (String(video.owner) !== String(req.user._id)) {
      throw new ApiError(403, "You are not authorized to delete this video");
    }

    await video.deleteOne();

    res.status(200).json(new ApiResponse(200, null, "Video deleted successfully"));
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    //const { videoId } = req.params
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID");

    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video not found");

    if (String(video.owner) !== String(req.user._id)) {
      throw new ApiError(403, "You are not authorized to toggle this video");
    }

    video.isPublished = !video.isPublished;
    await video.save();

    res.status(200).json(new ApiResponse(200, video, `Video is now ${video.isPublished ? "published" : "unpublished"}`));
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}


/*import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// 1. Get all videos with optional filtering, sorting, and pagination
const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query = "", sortBy = "createdAt", sortType = "desc", userId } = req.query;

  const filter = {
    isPublished: true,
    title: { $regex: query, $options: "i" },
    ...(userId && { owner: userId })
  };

  const sort = { [sortBy]: sortType === "asc" ? 1 : -1 };

  const videos = await Video.find(filter)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .populate("owner", "username email");

  const total = await Video.countDocuments(filter);

  res.status(200).json(
    new ApiResponse(200, {
      total,
      page: Number(page),
      limit: Number(limit),
      videos
    }, "Videos fetched successfully")
  );
});

// 2. Publish a new video
const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const videoLocal = req.files?.videoFile?.[0];
  const thumbnailLocal = req.files?.thumbnail?.[0];

  if (!videoLocal || !thumbnailLocal) {
    throw new ApiError(400, "Both video file and thumbnail are required");
  }

  const videoCloudinary = await uploadOnCloudinary(videoLocal.path);
  const thumbnailCloudinary = await uploadOnCloudinary(thumbnailLocal.path);

  if (!videoCloudinary?.url || !thumbnailCloudinary?.url) {
    throw new ApiError(500, "Cloudinary upload failed");
  }

  const newVideo = await Video.create({
    title,
    description,
    videoFile: videoCloudinary.url,
    thumbnail: thumbnailCloudinary.url,
    duration: videoCloudinary.duration || 0,
    owner: req.user._id,
  });

  res.status(201).json(new ApiResponse(201, newVideo, "Video uploaded successfully"));
});

// 3. Get a single video by ID
const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID");

  const video = await Video.findById(videoId).populate("owner", "username email");

  if (!video) throw new ApiError(404, "Video not found");

  res.status(200).json(new ApiResponse(200, video, "Video fetched successfully"));
});

// 4. Update a video (title, description, thumbnail)
const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;

  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID");

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found");

  if (String(video.owner) !== String(req.user._id)) {
    throw new ApiError(403, "You are not authorized to update this video");
  }

  if (title) video.title = title;
  if (description) video.description = description;

  if (req.file) {
    const newThumb = await uploadOnCloudinary(req.file.path);
    if (newThumb?.url) video.thumbnail = newThumb.url;
  }

  await video.save();

  res.status(200).json(new ApiResponse(200, video, "Video updated successfully"));
});

// 5. Delete a video
const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID");

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found");

  if (String(video.owner) !== String(req.user._id)) {
    throw new ApiError(403, "You are not authorized to delete this video");
  }

  await video.deleteOne();

  res.status(200).json(new ApiResponse(200, null, "Video deleted successfully"));
});

// 6. Toggle publish/unpublish
const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID");

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found");

  if (String(video.owner) !== String(req.user._id)) {
    throw new ApiError(403, "You are not authorized to toggle this video");
  }

  video.isPublished = !video.isPublished;
  await video.save();

  res.status(200).json(new ApiResponse(200, video, `Video is now ${video.isPublished ? "published" : "unpublished"}`));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus
};
*/