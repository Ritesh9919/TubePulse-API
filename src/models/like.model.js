import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
  {
    likeBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },

    likeable: {
      type: mongoose.Types.ObjectId,
      required: true,
      refPath: "onModel",
    },
    onModel: {
      type: String,
      required: true,
      enum: ["video", "comment", "tweet"],
    },
  },
  { timestamps: true },
);

export const Like = mongoose.model("Like", likeSchema);
