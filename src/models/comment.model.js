import monoose from "mongoose";

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

export const Comment = monoose.model("Comment", commentSchema);
