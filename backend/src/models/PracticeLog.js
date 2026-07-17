import mongoose from 'mongoose'

const PracticeLogSchema = new mongoose.Schema(
    {
        user_id: { type: String, required: true, index: true },
        plan_id: { type: String, default: null },
        week_id: { type: String, default: null },
        duration_minutes: { type: Number, required: true },
        notes: { type: String, default: '' },
        mood: { type: String, default: '' },
        practiced_at: { type: Date, default: Date.now },
    },
    { timestamps: true }
)

export const PracticeLog = mongoose.model('PracticeLog', PracticeLogSchema)
