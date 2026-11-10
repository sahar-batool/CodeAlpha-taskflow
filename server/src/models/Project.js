import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["owner", "member"], default: "member" },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      minlength: [2, "Project name must be at least 2 characters"],
      maxlength: [80, "Project name must be at most 80 characters"],
    },
    description: { type: String, trim: true, maxlength: 500, default: "" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: [memberSchema],
  },
  { timestamps: true }
);

projectSchema.index({ "members.user": 1 });

export default mongoose.model("Project", projectSchema);