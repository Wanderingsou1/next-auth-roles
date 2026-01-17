import mongoose, { Schema, models } from "mongoose";

const TodoSchema = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    description: { type: String, required: false },

    status: {type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending'},
    priority: {type: String, enum: ['low', 'medium', 'high'], default: 'medium'},
  },
  { timestamps: true }
);

export const Todo = models.Todo || mongoose.model("Todo", TodoSchema);

