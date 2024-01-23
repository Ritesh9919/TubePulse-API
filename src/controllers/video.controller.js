import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  uploadOnCloudinary,
  deleteFileOnCloudinary,
} from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  const filter = {};
   if(userId) {
      filter.owner = new mongoose.Types.ObjectId(userId);
   }

   if(query) {
      filter.$text = {$search:query}
   }

   const sort = {};
   if(sortBy) {
      sort[sortBy] = sortType == 'desc' ? -1: 1;
   }

   const videos = await Video.find(filter)
   .sort(sort)
   .skip((page - 1) * limit)
   .limit(limit)
   .populate({
    path:'owner',
    select:'username avatar email'
   })


   return res.status(200)
   .json(new ApiResponse(200, videos, 'video fetched successfully'));
});

const publishVideo = asyncHandler(async (req, res) => {
  // 1. take fields from req.body
  // 2. take videoFile and thubnail from req.files and upload videoFile and thubnail on cloudinary
  // 3. // create video model

  const { title, description } = req.body;

  if (!title || !description) {
    throw new ApiError(400, "Both fields are required");
  }

  const videoFileLocalPath = req.files?.videoFile[0]?.path;

  if (!videoFileLocalPath) {
    throw new ApiError(400, "Video file is required");
  }

  const videoThumbnailLocalPath = req.files?.thumbnail[0]?.path;

  if (!videoThumbnailLocalPath) {
    throw new ApiError(400, "Video thumbnail is required");
  }

  const cloudinaryVideo = await uploadOnCloudinary(videoFileLocalPath);

  if (!cloudinaryVideo) {
    throw new ApiError(
      400,
      "Something went wrong while uploadind video file on cloudinary",
    );
  }

  const cloudinaryThumbnail = await uploadOnCloudinary(videoThumbnailLocalPath);

  if (!cloudinaryThumbnail) {
    throw new ApiError(
      400,
      "Something went wrong while uploadind video thumbnail file on cloudinary",
    );
  }

  const video = await Video.create({
    title,
    description,
    duration: cloudinaryVideo?.duration,
    videoFile: { key: cloudinaryVideo.public_id, url: cloudinaryVideo.url },
    thumbnail: {
      key: cloudinaryThumbnail.public_id,
      url: cloudinaryThumbnail.url,
    },
    owner: req.user._id,
  });

  if (!video) {
    throw new ApiError(500, "Something went wrong while uploading video");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, video, "Video uploaded successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const video = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
      },
    },

    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              username: 1,
              avatar: 1,
              email: 1,
            },
          },
        ],
      },
    },

    {
      $addFields: {
        owner: {
          $first: "$owner",
        },
      },
    },
  ]);

  if (!video) {
    throw new ApiError(404, "Video does not exist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;

  if (!title || !description) {
    throw new ApiError(400, "Both fields are required");
  }

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video does not exist");
  }

  const videoLocalPath = req.files?.videoFile[0]?.path;
  if (!videoLocalPath) {
    throw new ApiError(400, "Video file is required");
  }

  const videoThumbnailLocalPath = req.files?.thumbnail[0]?.path;
  if (!videoThumbnailLocalPath) {
    throw new ApiError(400, "Video thumbnail file is required");
  }

  const cloudinaryVideo = await uploadOnCloudinary(videoLocalPath);
  if (!cloudinaryVideo) {
    throw new ApiError(
      400,
      "Something went wrong while uploadind video file on cloudinary",
    );
  }

  const cloudinaryThumbnail = await uploadOnCloudinary(videoThumbnailLocalPath);
  if (!cloudinaryThumbnail) {
    throw new ApiError(
      400,
      "Something went wrong while uploadind video thumbnail on cloudinary",
    );
  }

  if (!video.owner.equals(req.user._id)) {
    throw new ApiError(401, "You can not update this video");
  }

  if (video.videoFile) {
    await deleteFileOnCloudinary(video.videoFile.key);
  }

  if (video.thumbnail) {
    await deleteFileOnCloudinary(video.thumbnail.key);
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title,
        description,
        duration: cloudinaryVideo?.duration,
        videoFile: cloudinaryVideo?.url,
        thumbnail: cloudinaryThumbnail?.url,
      },
    },
    { new: true },
  );

  if (!updatedVideo) {
    throw new ApiError(500, "Something went wrong while updating video");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video does not exist");
  }

  if (!video.owner.equals(req.user._id)) {
    throw new ApiError(401, "You can not delete this video");
  }

  if (video.videoFile) {
    await deleteFileOnCloudinary(video.videoFile.key);
  }

  if (video.thumbnail) {
    await deleteFileOnCloudinary(video.thumbnail.key);
  }

  await Video.findByIdAndDelete(videoId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
   
  if(!isValidObjectId(videoId)) {
    throw new ApiError(400, 'Invalid video id');
  }

  const video = await Video.findById(videoId);
  if(!video) {
    throw new ApiError(404, 'Video does not exist');
  }

  video.isPublished = !video.isPublished;
  await video.save();

  return res.status(200)
  .json(new ApiResponse(200, {}, 'Video toggle successfully'));

});



export { getAllVideos, publishVideo, getVideoById, updateVideo, deleteVideo, togglePublishStatus };
