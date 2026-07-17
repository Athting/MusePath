import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        passwordHash: { type: String, required: true },
        username: { type: String, default: '' },
        avatar_url: { type: String, default: '' },
        instrument: { type: String, default: '' },
        skill_level: { type: String, enum: ['beginner', 'intermediate', 'advanced', ''], default: '' },
        goal_duration: { type: String, default: '' },
        daily_time: { type: String, default: '' },
        music_interests: { type: [String], default: [] },
        learning_mood: { type: String, default: '' },
        xp: { type: Number, default: 0 },
        streak_days: { type: Number, default: 0 },
        last_practice_date: { type: Date, default: null },
        total_practice_minutes: { type: Number, default: 0 },
    },
    { timestamps: true }
)

export const User = mongoose.model('User', UserSchema)
