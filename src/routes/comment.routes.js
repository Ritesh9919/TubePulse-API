import express from 'express';
const router = express.Router();
import {varifyJwt} from '../middlewares/auth.middleware.js';
import {getVideoComments, addComment, updateComment, deleteComment} from '../controllers/comment.controller.js';

router.post('/:videoId', varifyJwt, addComment);
router.get('/:videoId', varifyJwt, getVideoComments);
router.put('/:commentId', varifyJwt, updateComment);
router.delete('/:commentId', varifyJwt, deleteComment);


export default router;