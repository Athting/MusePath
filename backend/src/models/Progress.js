import mongoose from 'mongoose'

const ProgressSchema = new mongoose.Schema(
    {
        user_id: { type: String, required: true, index: true },
        plan_id: { type: String, required: true, index: true },
        month_number: { type: Number, default: 1 },
        completed_weeks: { type: Number, default: 0 },
        total_weeks: { type: Number, default: 0 },
        completion_percentage: { type: Number, default: 0 },
        xp_earned: { type: Number, default: 0 },
    },
    { timestamps: true }
)

ProgressSchema.index({ user_id: 1, plan_id: 1 }, { unique: true })

export const Progress = mongoose.model('Progress', ProgressSchema)
