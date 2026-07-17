import { Achievement } from '../models/Achievement.js'
import { LearningPlan } from '../models/LearningPlan.js'
import { LearningWeek } from '../models/LearningWeek.js'
import { PracticeLog } from '../models/PracticeLog.js'
import { Progress } from '../models/Progress.js'
import { SavedSong } from '../models/SavedSong.js'
import { User } from '../models/User.js'
import { sameUser, sendServerError, withId } from './controller.helpers.js'

export function healthController(_req, res) {
    return res.status(200).json({ status: 'ok', message: 'MusePath API is running 🎵' })
}

export async function getDashboardController(req, res) {
    try {
        const userId = String(req.query.userId || '')
        if (!userId) return res.status(400).json({ error: 'userId required' })
        if (!sameUser(req, userId)) return res.status(403).json({ error: 'Forbidden' })

        const user = await User.findById(userId)
        if (!user) return res.status(404).json({ error: 'User not found' })

        const plan = await LearningPlan.findOne({ user_id: userId, is_active: true }).sort({ createdAt: -1 }).lean()
        let progress = null
        let currentWeek = null
        let weeks = []

        if (plan) {
            progress = await Progress.findOne({ user_id: userId, plan_id: plan._id.toString() }).lean()
            currentWeek = await LearningWeek.findOne({ user_id: userId, plan_id: plan._id.toString(), is_completed: false }).sort({ month_number: 1, week_number: 1 }).lean()
            weeks = await LearningWeek.find({ plan_id: plan._id.toString() }).sort({ month_number: 1, week_number: 1 }).lean()
        }

        const recentLogs = await PracticeLog.find({ user_id: userId }).sort({ practiced_at: -1 }).limit(7).lean()
        const savedSongs = await SavedSong.find({ user_id: userId }).sort({ createdAt: -1 }).limit(4).lean()
        const achievements = await Achievement.find({ user_id: userId }).sort({ earned_at: -1 }).lean()

        return res.status(200).json({
            user,
            plan: withId(plan),
            progress,
            currentWeek,
            weeks,
            recentLogs,
            savedSongs,
            achievements,
            streak: user.streak_days || 0,
            totalMinutes: user.total_practice_minutes || 0,
            xp: user.xp || 0
        })
    } catch (error) {
        return sendServerError(res, 'Error in getDashboardController', 'Failed to load dashboard', error)
    }
}
