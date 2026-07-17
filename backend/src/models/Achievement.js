import mongoose from 'mongoose'

const AchievementSchema = new mongoose.Schema(
    {
        user_id: { type: String, required: true, index: true },
        achievement_key: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String, default: '' },
        icon: { type: String, default: '🏆' },
        xp_reward: { type: Number, default: 50 },
        xp_granted: { type: Boolean, default: false },
        earned_at: { type: Date, default: Date.now },
    },
    { timestamps: true }
)

AchievementSchema.index({ user_id: 1, achievement_key: 1 }, { unique: true })

export const Achievement = mongoose.model('Achievement', AchievementSchema)
