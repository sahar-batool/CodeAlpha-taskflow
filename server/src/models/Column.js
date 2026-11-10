import mongoose from "mongoose";

const columnSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    title: { type: String, required: [true, "Column title is required"], trim: true, maxlength: 50 },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Column", columnSchema);