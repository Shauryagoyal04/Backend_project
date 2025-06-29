import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    //const {videoId} = req.params
    //TODO: toggle like on video
     const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: req.user._id,
    });

    if (existingLike) {
        await existingLike.deleteOne();
        return res.status(200).json(
        new ApiResponse(200, null, "Unliked the video")
        );
    }

    const newLike = await Like.create({
        video: videoId,
        likedBy: req.user._id,
    });
    if(!newLike) {
        throw new ApiError(500, "Failed to like the video");
    }
    res.status(201).json(
        new ApiResponse(201, newLike, "Liked the video")
    );
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if(!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }
    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: req.user._id,
    });

    if (existingLike) {
        await existingLike.deleteOne();
        return res.status(200).json(
            new ApiResponse(200, null, "Unliked the comment")
        );
    }
    const newLike = await Like.create({
        comment: commentId,
        likedBy: req.user._id,
    });
    if(!newLike) {
        throw new ApiError(500, "Failed to like the comment");
    }
    res.status(201).json(
        new ApiResponse(201, newLike, "Liked the comment")
    );

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user._id,
    });
    if(existingLike) {
        await existingLike.deleteOne();
        return res.status(200).json(
            new ApiResponse(200, null, "Unliked the tweet")
        );
    }
    const newLike = await Like.create({
        tweet: tweetId,
        likedBy: req.user._id,
    });
    if(!newLike) {
        throw new ApiError(500, "Failed to like the tweet");
    }
    res.status(201).json(
        new ApiResponse(201, newLike, "Liked the tweet")
    );
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const likedVideos = await Like.find({
    likedBy: req.user._id,
    video: { $ne: null },
    }).populate("video");

    res.status(200).json(
        new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
    );
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}

/*
import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Toggle like on a video
const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const existingLike = await Like.findOne({
    video: videoId,
    likedBy: req.user._id,
  });

  if (existingLike) {
    await existingLike.deleteOne();
    return res.status(200).json(
      new ApiResponse(200, null, "Unliked the video")
    );
  }

  const newLike = await Like.create({
    video: videoId,
    likedBy: req.user._id,
  });

  res.status(201).json(
    new ApiResponse(201, newLike, "Liked the video")
  );
});

// Toggle like on a comment
const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  const existingLike = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
  });

  if (existingLike) {
    await existingLike.deleteOne();
    return res.status(200).json(
      new ApiResponse(200, null, "Unliked the comment")
    );
  }

  const newLike = await Like.create({
    comment: commentId,
    likedBy: req.user._id,
  });

  res.status(201).json(
    new ApiResponse(201, newLike, "Liked the comment")
  );
});

// Toggle like on a tweet
const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }

  const existingLike = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user._id,
  });

  if (existingLike) {
    await existingLike.deleteOne();
    return res.status(200).json(
      new ApiResponse(200, null, "Unliked the tweet")
    );
  }

  const newLike = await Like.create({
    tweet: tweetId,
    likedBy: req.user._id,
  });

  res.status(201).json(
    new ApiResponse(201, newLike, "Liked the tweet")
  );
});

// Get all videos liked by the user
const getLikedVideos = asyncHandler(async (req, res) => {
  const likedVideos = await Like.find({
    likedBy: req.user._id,
    video: { $ne: null },
  }).populate("video");

  res.status(200).json(
    new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
  );
});

export {
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
  getLikedVideos,
};

*/