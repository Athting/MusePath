import mongoose from 'mongoose'

const SavedSongSchema = new mongoose.Schema(
    {
        user_id: { type: String, required: true, index: true },
        song_title: { type: String, required: true },
        song_artist: { type: String, required: true },
        difficulty: { type: String, default: '' },
        genre: { type: String, default: '' },
        why_recommended: { type: String, default: '' },
        skills_learned: { type: [String], default: [] },
        action: { type: String, enum: ['save', 'add_to_plan', 'learn_later'], default: 'save' },
    },
    { timestamps: true }
)

SavedSongSchema.index({ user_id: 1, song_title: 1, song_artist: 1 }, { unique: true })

export const SavedSong = mongoose.model('SavedSong', SavedSongSchema)
