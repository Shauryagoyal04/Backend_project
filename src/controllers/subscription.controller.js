import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    //const {channelId} = req.params
    // TODO: toggle subscription
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    if (String(req.user._id) === String(channelId)) {
        throw new ApiError(400, "You cannot subscribe to your own channel");
    }

    const existingSubscription = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId,
    });

    if (existingSubscription) {
        // Unsubscribe
        await existingSubscription.deleteOne();
        return res.status(200).json(
        new ApiResponse(200, null, "Unsubscribed successfully")
        );
    }

    // Subscribe
    const newSubscription = await Subscription.create({
        subscriber: req.user._id,
        channel: channelId,
    });

    res.status(201).json(
        new ApiResponse(201, newSubscription, "Subscribed successfully")
    );
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    //const {channelId} = req.params
        const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    const subscribers = await Subscription.find({ channel: channelId }).populate(
        "subscriber",
        "username email"
    );

    res.status(200).json(
        new ApiResponse(200, subscribers, "Channel subscribers fetched")
    );
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    //const { subscriberId } = req.params
    const { subscriberId } = req.params;

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber ID");
    }

    const channels = await Subscription.find({ subscriber: subscriberId }).populate(
        "channel",
        "username email"
    );

    res.status(200).json(
        new ApiResponse(200, channels, "Subscribed channels fetched")
    );
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}


/*
import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Toggle subscribe/unsubscribe
const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  if (String(req.user._id) === String(channelId)) {
    throw new ApiError(400, "You cannot subscribe to your own channel");
  }

  const existingSubscription = await Subscription.findOne({
    subscriber: req.user._id,
    channel: channelId,
  });

  if (existingSubscription) {
    // Unsubscribe
    await existingSubscription.deleteOne();
    return res.status(200).json(
      new ApiResponse(200, null, "Unsubscribed successfully")
    );
  }

  // Subscribe
  const newSubscription = await Subscription.create({
    subscriber: req.user._id,
    channel: channelId,
  });

  res.status(201).json(
    new ApiResponse(201, newSubscription, "Subscribed successfully")
  );
});

// Get list of subscribers to a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  const subscribers = await Subscription.find({ channel: channelId }).populate(
    "subscriber",
    "username email"
  );

  res.status(200).json(
    new ApiResponse(200, subscribers, "Channel subscribers fetched")
  );
});

// Get list of channels a user has subscribed to
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Invalid subscriber ID");
  }

  const channels = await Subscription.find({ subscriber: subscriberId }).populate(
    "channel",
    "username email"
  );

  res.status(200).json(
    new ApiResponse(200, channels, "Subscribed channels fetched")
  );
});

export {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels,
};

*/ 