import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    task: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true, index: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: {
      type: String,
      required: [true, "Comment cannot be empty"],
      trim: true,
      maxlength: [1000, "Comment must be at most 1000 characters"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Comment", commentSchema);