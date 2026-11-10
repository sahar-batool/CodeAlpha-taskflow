import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    column: { type: mongoose.Schema.Types.ObjectId, ref: "Column", required: true },
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: [120, "Task title must be at most 120 characters"],
    },
    description: { type: String, trim: true, maxlength: 2000, default: "" },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    dueDate: { type: Date, default: null },
    order: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

taskSchema.index({ column: 1, order: 1 });

export default mongoose.model("Task", taskSchema);