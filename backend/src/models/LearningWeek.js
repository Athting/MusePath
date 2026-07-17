import mongoose from "mongoose";

const LearningWeekSchema = new mongoose.Schema(
    {
        plan_id: { type: String, required: true, index: true },
        user_id: { type: String, required: true, index: true },
        month_number: { type: Number, required: true },
        week_number: { type: Number, required: true },
        title: { type: String, default: "" },
        topics: { type: [String], default: [] },
        skills: { type: [String], default: [] },
        practice_goal: { type: String, default: "" },
        practice_minutes: { type: Number, default: 20 },
        milestone: { type: String, default: "" },
        youtube_searches: { type: [String], default: [] },
        is_completed: { type: Boolean, default: false },
        completed_at: { type: Date, default: null },
    },
    { timestamps: true },
);


export const LearningWeek = mongoose.model("LearningWeek", LearningWeekSchema);
