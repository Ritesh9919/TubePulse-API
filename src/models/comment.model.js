import monoose from "mongoose";
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const commentSchema = new monoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    video: {
      type: monoose.Types.ObjectId,
      ref: "Video",
    },
    owner: {
      type: monoose.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

commentSchema.plugin(mongooseAggregatePaginate);

export const Comment = monoose.model("Comment", commentSchema);
