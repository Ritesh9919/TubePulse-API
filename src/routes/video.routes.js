import express from 'express';
const router = express.Router();

import { varifyJwt } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

import {
  getAllVideos,
  publishVideo,
  getVideoById,
  updateVideo,
  deleteVideo
}
from '../controllers/video.controller.js';

router.post('/', varifyJwt, upload.fields([
    {
        name:'videoFile',
        maxCount:1
    },
    {
        name:'thumbnail',
        maxCount:1
    }
]), publishVideo);

router.get('/', varifyJwt, getAllVideos);
router.get('/:videoId', varifyJwt, getVideoById);
router.put('/:videoId', varifyJwt, upload.fields(
    [
        {
            name:'videoFile',
            maxCount:1
        },
        {
            name:'thumbnail',
            maxCount:1
        }
    ]
), updateVideo);
router.delete('/:videoId', varifyJwt, deleteVideo);


export default router;