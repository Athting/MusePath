import { Achievement } from '../models/Achievement.js'
import { LearningPlan } from '../models/LearningPlan.js'
import { PracticeLog } from '../models/PracticeLog.js'
import { SavedSong } from '../models/SavedSong.js'
import { User } from '../models/User.js'
import { sameUser, sendServerError, withId } from './controller.helpers.js'

export async function getProfileController(req, res) {
    try {
        const userId = String(req.query.userId || '')
        if (!userId) return res.status(400).json({ error: 'userId required' })
        if (!sameUser(req, userId)) return res.status(403).json({ error: 'Forbidden' })

        const user = await User.findById(userId).lean()
        if (!user) return res.status(404).json({ error: 'User not found' })

        const plans = await LearningPlan.find({ user_id: userId }).sort({ createdAt: -1 }).lean()
        const savedSongs = await SavedSong.find({ user_id: userId }).sort({ createdAt: -1 }).lean()
        const achievements = await Achievement.find({ user_id: userId }).sort({ earned_at: -1 }).lean()
        const logs = await PracticeLog.find({ user_id: userId }).sort({ practiced_at: -1 }).limit(100).lean()

        const totalSessions = logs.length
        const totalMinutes = logs.reduce((sum, log) => sum + (log.duration_minutes || 0), 0)
        const totalHours = Math.round((totalMinutes / 60) * 10) / 10

        const stats = {
            totalSessions,
            totalMinutes,
            totalHours,
            savedSongsCount: savedSongs.length,
            plansCount: plans.length,
            achievementsCount: achievements.length
        }

        return res.status(200).json({ user, plans: plans.map(withId), savedSongs, achievements, stats })
    } catch (error) {
        return sendServerError(res, 'Error in getProfileController', 'Failed to load profile', error)
    }
}

export async function updateProfileController(req, res) {
    try {
        const { userId, username, avatar_url } = req.body || {}
        if (!userId) return res.status(400).json({ error: 'userId required' })
        if (!sameUser(req, userId)) return res.status(403).json({ error: 'Forbidden' })

        const updates = {}
        if (typeof username === 'string') updates.username = username
        if (typeof avatar_url === 'string') updates.avatar_url = avatar_url

        const user = await User.findByIdAndUpdate(userId, { $set: updates }, { new: true }).lean()
        return res.status(200).json({ user: user || {} })
    } catch (error) {
        return sendServerError(res, 'Error in updateProfileController', 'Failed to update profile', error)
    }
}
