import mongoose from 'mongoose'

const LearningPlanSchema = new mongoose.Schema(
    {
        user_id: { type: String, required: true, index: true },
        title: { type: String, required: true },
        summary: { type: String, default: '' },
        instrument: { type: String, required: true },
        skill_level: { type: String, required: true },
        goal_duration: { type: String, required: true },
        daily_time: { type: String, required: true },
        music_interests: { type: [String], default: [] },
        learning_mood: { type: String, default: '' },
        total_months: { type: Number, required: true },
        plan_data: { type: mongoose.Schema.Types.Mixed, required: true },
        is_active: { type: Boolean, default: true },
        tips: { type: [String], default: [] },
        motivational_message: { type: String, default: '' },
    },
    { timestamps: true }
)

export const LearningPlan = mongoose.model('LearningPlan', LearningPlanSchema)
