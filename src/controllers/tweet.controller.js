import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
        throw new ApiError(400, "Tweet content cannot be empty");
    }

    const tweet = await Tweet.create({
        content,
        owner: req.user._id,
    });

    res.status(201).json(new ApiResponse(201, tweet, "Tweet created successfully"));
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    const tweets = await Tweet.find({ owner: userId }).sort({ createdAt: -1 });

    res.status(200).json(new ApiResponse(200, tweets, "Tweets fetched successfully"));
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(tweetId)) {
      throw new ApiError(400, "Invalid tweet ID");
    }

    if (!content || content.trim().length === 0) {
      throw new ApiError(400, "Updated content cannot be empty");
    }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
      throw new ApiError(404, "Tweet not found");
    }

    if (String(tweet.owner) !== String(req.user._id)) {
      throw new ApiError(403, "You are not authorized to update this tweet");
    }

    tweet.content = content;
    await tweet.save();

    res.status(200).json(new ApiResponse(200, tweet, "Tweet updated successfully"));
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params;

    if (!isValidObjectId(tweetId)) {
      throw new ApiError(400, "Invalid tweet ID");
    }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
      throw new ApiError(404, "Tweet not found");
    }

    if (String(tweet.owner) !== String(req.user._id)) {
      throw new ApiError(403, "You are not authorized to delete this tweet");
    }

    await tweet.deleteOne();

    res.status(200).json(new ApiResponse(200, null, "Tweet deleted successfully"));
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}


/*
import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// 📌 Create a new tweet
const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content || content.trim().length === 0) {
    throw new ApiError(400, "Tweet content cannot be empty");
  }

  const tweet = await Tweet.create({
    content,
    owner: req.user._id,
  });

  res.status(201).json(new ApiResponse(201, tweet, "Tweet created successfully"));
});

// 📌 Get all tweets by a specific user
const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const tweets = await Tweet.find({ owner: userId }).sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, tweets, "Tweets fetched successfully"));
});

// 📌 Update a tweet (only if owner)
const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }

  if (!content || content.trim().length === 0) {
    throw new ApiError(400, "Updated content cannot be empty");
  }

  const tweet = await Tweet.findById(tweetId);

  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  if (String(tweet.owner) !== String(req.user._id)) {
    throw new ApiError(403, "You are not authorized to update this tweet");
  }

  tweet.content = content;
  await tweet.save();

  res.status(200).json(new ApiResponse(200, tweet, "Tweet updated successfully"));
});

// 📌 Delete a tweet (only if owner)
const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }

  const tweet = await Tweet.findById(tweetId);

  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  if (String(tweet.owner) !== String(req.user._id)) {
    throw new ApiError(403, "You are not authorized to delete this tweet");
  }

  await tweet.deleteOne();

  res.status(200).json(new ApiResponse(200, null, "Tweet deleted successfully"));
});

export {
  createTweet,
  getUserTweets,
  updateTweet,
  deleteTweet
};
*/