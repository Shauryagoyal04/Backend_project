import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    //const {name, description} = req.body

    //TODO: create playlist

    const { name, description } = req.body;

    if (!name || !description) {
        throw new ApiError(400, "Name and description are required");
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user._id,
    });

    res.status(201).json(
        new ApiResponse(201, playlist, "Playlist created successfully")
    );
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    //const {userId} = req.params
    //TODO: get user playlists

    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    const playlists = await Playlist.find({ owner: userId });
    if (!playlists || playlists.length === 0) {
        throw new ApiError(404, "No playlists found for this user");
    }    

    res.status(200).json(
        new ApiResponse(200, playlists, "User playlists fetched successfully")
    );
})

const getPlaylistById = asyncHandler(async (req, res) => {
    //const {playlistId} = req.params
    //TODO: get playlist by id
    const { playlistId } = req.params;

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }

    const playlist = await Playlist.findById(playlistId)
        .populate("videos")
        .populate("owner", "username email");

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    res.status(200).json(
        new ApiResponse(200, playlist, "Playlist fetched successfully")
    );
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    //const {playlistId, videoId} = req.params
    const { playlistId, videoId } = req.params;

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video or playlist ID");
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (String(playlist.owner) !== String(req.user._id)) {
        throw new ApiError(403, "You are not authorized to modify this playlist");
    }

    if (playlist.videos.includes(videoId)) {
        throw new ApiError(409, "Video already exists in the playlist");
    }

    playlist.videos.push(videoId);
    await playlist.save();

    res.status(200).json(
        new ApiResponse(200, playlist, "Video added to playlist")
    );
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    //const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    const { playlistId, videoId } = req.params;

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video or playlist ID");
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (String(playlist.owner) !== String(req.user._id)) {
        throw new ApiError(403, "You are not authorized to modify this playlist");
    }

    const index = playlist.videos.indexOf(videoId);
    if (index === -1) {
        throw new ApiError(404, "Video not found in playlist");
    }

    playlist.videos.splice(index, 1);
    await playlist.save();

    res.status(200).json(
        new ApiResponse(200, playlist, "Video removed from playlist")
    );

})

const deletePlaylist = asyncHandler(async (req, res) => {
    //const {playlistId} = req.params
    // TODO: delete playlist
     const { playlistId } = req.params;

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (String(playlist.owner) !== String(req.user._id)) {
        throw new ApiError(403, "You are not authorized to delete this playlist");
    }

    await playlist.deleteOne();

    res.status(200).json(
        new ApiResponse(200, null, "Playlist deleted successfully")
    );
})

const updatePlaylist = asyncHandler(async (req, res) => {
    //const {playlistId} = req.params
    //const {name, description} = req.body
    //TODO: update playlist
    const { playlistId } = req.params;
    const { name, description } = req.body;

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (String(playlist.owner) !== String(req.user._id)) {
        throw new ApiError(403, "You are not authorized to update this playlist");
    }

    if (name) playlist.name = name;
    if (description) playlist.description = description;

    await playlist.save();

    res.status(200).json(
        new ApiResponse(200, playlist, "Playlist updated successfully")
    );
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}

/*
import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// 1. Create a new playlist
const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name || !description) {
    throw new ApiError(400, "Name and description are required");
  }

  const playlist = await Playlist.create({
    name,
    description,
    owner: req.user._id,
  });

  res.status(201).json(
    new ApiResponse(201, playlist, "Playlist created successfully")
  );
});

// 2. Get all playlists created by a user
const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const playlists = await Playlist.find({ owner: userId });

  res.status(200).json(
    new ApiResponse(200, playlists, "User playlists fetched successfully")
  );
});

// 3. Get details of a playlist by its ID
const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID");
  }

  const playlist = await Playlist.findById(playlistId)
    .populate("videos")
    .populate("owner", "username email");

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  res.status(200).json(
    new ApiResponse(200, playlist, "Playlist fetched successfully")
  );
});

// 4. Add a video to a playlist
const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video or playlist ID");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  if (String(playlist.owner) !== String(req.user._id)) {
    throw new ApiError(403, "You are not authorized to modify this playlist");
  }

  if (playlist.videos.includes(videoId)) {
    throw new ApiError(409, "Video already exists in the playlist");
  }

  playlist.videos.push(videoId);
  await playlist.save();

  res.status(200).json(
    new ApiResponse(200, playlist, "Video added to playlist")
  );
});

// 5. Remove a video from a playlist
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video or playlist ID");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  if (String(playlist.owner) !== String(req.user._id)) {
    throw new ApiError(403, "You are not authorized to modify this playlist");
  }

  const index = playlist.videos.indexOf(videoId);
  if (index === -1) {
    throw new ApiError(404, "Video not found in playlist");
  }

  playlist.videos.splice(index, 1);
  await playlist.save();

  res.status(200).json(
    new ApiResponse(200, playlist, "Video removed from playlist")
  );
});

// 6. Delete a playlist
const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  if (String(playlist.owner) !== String(req.user._id)) {
    throw new ApiError(403, "You are not authorized to delete this playlist");
  }

  await playlist.deleteOne();

  res.status(200).json(
    new ApiResponse(200, null, "Playlist deleted successfully")
  );
});

// 7. Update playlist details
const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  if (String(playlist.owner) !== String(req.user._id)) {
    throw new ApiError(403, "You are not authorized to update this playlist");
  }

  if (name) playlist.name = name;
  if (description) playlist.description = description;

  await playlist.save();

  res.status(200).json(
    new ApiResponse(200, playlist, "Playlist updated successfully")
  );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};

*/