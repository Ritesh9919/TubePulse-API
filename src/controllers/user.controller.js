import path from "path";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
// import {uploadOnCloudinary} from '../utils/cloudinary.js';
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateAccessAndRefereshTokens } from "../utils/generateAccessAndRefreshToken.js";
import cookieOption from "../utils/cookieOptions.js";

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;
  if (
    [fullName, email, username, password].some((field) => field?.trim() == "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existedUser) {
    throw new ApiError(409, "User with email or username already exist");
  }

  console.log(req.files);

  const avatarLocalPath = path.join("temp", req.files?.avatar[0]?.filename);
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = path.join("temp", req.files.coverImage[0].filename);
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  //    const avatar = await uploadOnCloudinary(avatarLocalPath);
  //    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  const user = await User.create({
    fullName,
    avatar: avatarLocalPath,
    coverImage: coverImageLocalPath,
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );
  if (!createdUser) {
    throw new ApiError(505, "Something wrong while registering user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registerd successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!email || !username) {
    throw new ApiError(400, "username or email is required");
  }

  const user = await User.findOne({ $or: [{ username }, { password }] });
  if (!user) {
    throw new ApiError(400, "user does not exist");
  }

  const isPasswordValid = user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credential");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user._id,
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  res
    .status(200)
    .cookie("accessToken", accessToken, cookieOption)
    .cookie("refreshToken", refreshToken, cookieOption)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully",
      ),
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $set: { refreshToken: undefined } },
    {
      new: true,
    },
  );

  return res
    .status(200)
    .clearCookie("accessToken", cookieOption)
    .clearCookie("refreshToken", cookieOption)
    .json(new ApiResponse(200, {}, "User logged out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decoded = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );
    const user = await User.findById(decoded._id);
    if (!user) {
      throw new ApiError(401, "Invalid refreshToken");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError("Refresh token expired or used");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
      user._id,
    );
    const newRefreshToken = refreshToken;

    res
      .status(200)
      .cookie("accessToken", accessToken, cookieOption)
      .cookie("refreshToken", newRefreshToken, cookieOption)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "access token refreshed",
        ),
      );
  } catch (error) {
    throw new ApiError(401, error?.message, "Invalid refresh token");
  }
});


const changePassword = asyncHandler(async(req, res)=> {
  const {oldPassword, newPassword} = req.body;

  const user = await User.findById(req.user._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if(!isPasswordCorrect) {
    throw new ApiError(400, 'Invalid old password');
  }

  user.password = newPassword;
  await user.save({validateBeforeSave:false});

  return res.status(200)
  .json(new ApiResponse(200, {}, 'Password updated successfully'));

})


const getCurrentUser = asyncHandler(async(req, res)=> {
    return res.status(200)
    .json(new ApiResponse(200, req.user, 'Current user fetched successfully'));
})



const updateAccountDetails = asyncHandler(async(req, res)=> {
  const {fullName, email} = req.body;

  if(!fullName || !email) {
    throw new ApiError(400, 'All fields are required');
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {$set:{
      fullName,
      email
    }},
    {new:true}
  ).select('-password');

  return res.status(200)
  .json(new ApiResponse(200, user, 'User accound details updated successfully'));

})



const updateUserAvatar = asyncHandler(async(req, res)=> {
    const avatarLocalPath = 'temp/' + req.file.filename;

    console.log(avatarLocalPath);

    if(!avatarLocalPath) {
      throw new ApiError(400, 'Avatar file is required');
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {$set:{avatar:avatarLocalPath}},
      {new: true}
    ).select('-password')

    return res.status(200)
    .json(new ApiResponse(200, user, 'User avatar updated successfully'));
})



const updateUserCoverImage = asyncHandler(async(req, res)=> {
  const coverImageLocalPath = 'temp/' + req.file.filename;

  console.log(coverImageLocalPath);

  if(!coverImageLocalPath) {
    throw new ApiError(400, 'coverImage file is required');
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {$set:{coverImage:coverImageLocalPath}},
    {new: true}
  ).select('-password')

  

  return res.status(200)
  .json(new ApiResponse(200, user, 'User coverImage updated successfully'));
})


const getUserChannelProfile = asyncHandler(async(req, res)=> {
    
  const {username} = req.params;

  if(!username) {
    throw new ApiError(400, 'username is required ');
  }

  const channel = await User.aggregate([
    {
      $match:{
        username:username
      }
    },
    {
      $lookup:{
        from:"subscriptions",
        localField:"_id",
        foreignField:"channel",
        as:"subscribers"
      }
    },
    {
      $lookup:{
        from:"subscriptions",
        localField:"_id",
        foreignField:"subscriber",
        as:"subscribedTo"
      }
    },
    {
      $addFields:{
        subscribersCount:{
          $size:"$subscribers"
        },
        channelsSubscribedCount:{
          $size:"$subscribedTo"
        },
        isSubscibed:{
          $cond:{
            if:{$in:[req.user?._id, "$subscribers.subscriber"]},
            then:true,
            else:false
          }
        }
      }
    },
    {
      $project:{
        fullName:1,
        username:1,
        email:1,
        avatar:1,
        coverImage:1,
        isSubscribed:1,
        subscribersCount:1,
        channelsSubscribedCount:1

      }
    }

  ])


  if(!channel?.length) {
    throw new ApiError(404, 'channel does not exist');
  }

  res.status(200)
  .json(new ApiResponse(200, channel[0], 'User channel fetched successfully'));


})











export { 
  registerUser,
   loginUser, 
   logoutUser, 
   refreshAccessToken,
   changePassword,
   getCurrentUser,
   updateAccountDetails,
   updateUserAvatar,
   updateUserCoverImage,
   getUserChannelProfile

   };
