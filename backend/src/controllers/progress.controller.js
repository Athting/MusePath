import { Achievement } from '../models/Achievement.js'
import { LearningWeek } from '../models/LearningWeek.js'
import { PracticeLog } from '../models/PracticeLog.js'
import { Progress } from '../models/Progress.js'
import { User } from '../models/User.js'
import { grantAchievement } from './achievement.controller.js'
import { sameUser, sendServerError } from './controller.helpers.js'

export async function logProgressController(req, res) {
    try {
        const { userId, weekId, planId, durationMinutes, notes, mood } = req.body || {}
        if (!userId || !durationMinutes) return res.status(400).json({ error: 'userId and durationMinutes required' })
        if (!sameUser(req, userId)) return res.status(403).json({ error: 'Forbidden' })

        const user = await User.findById(userId)
        if (!user) return res.status(404).json({ error: 'User not found' })

        const xpEarned = Math.floor(Number(durationMinutes) / 5) * 10

        const log = await PracticeLog.create({
            user_id: userId,
            plan_id: planId || null,
            week_id: weekId || null,
            duration_minutes: Number(durationMinutes),
            notes: notes || '',
            mood: mood || '',
            practiced_at: new Date()
        })

        const today = new Date()
        const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
        const last = user.last_practice_date ? new Date(user.last_practice_date) : null
        const lastOnly = last ? new Date(last.getFullYear(), last.getMonth(), last.getDate()) : null

        if (!lastOnly) {
            user.streak_days = 1
        } else {
            const diffDays = Math.round((todayOnly - lastOnly) / (1000 * 60 * 60 * 24))
            if (diffDays === 1) user.streak_days = (user.streak_days || 0) + 1
            else if (diffDays > 1) user.streak_days = 1
        }

        user.total_practice_minutes = (user.total_practice_minutes || 0) + Number(durationMinutes)
        user.xp = (user.xp || 0) + xpEarned
        user.last_practice_date = todayOnly
        await user.save()

        if (weekId && planId) {
            const week = await LearningWeek.findById(weekId)
            if (week && !week.is_completed) {
                week.is_completed = true
                week.completed_at = new Date()
                await week.save()

                const allWeeks = await LearningWeek.find({ user_id: userId, plan_id: planId }).lean()
                const total = allWeeks.length
                const completed = allWeeks.filter(w => w.is_completed).length
                const pct = total ? Math.round((completed * 10000) / total) / 100 : 0

                await Progress.updateOne(
                    { user_id: userId, plan_id: planId },
                    {
                        $set: {
                            month_number: week.month_number || 1,
                            total_weeks: total,
                            completed_weeks: completed,
                            completion_percentage: pct,
                            xp_earned: user.xp
                        }
                    },
                    { upsert: true }
                )

                if (completed === 1) {
                    await grantAchievement(userId, 'first_week', 'First Week Done!', 'Completed your first week of practice', '🎯', 150)
                }
                if (completed === 4) {
                    await grantAchievement(userId, 'first_month', 'Month Mastery', 'Completed your first full month', '🏅', 500)
                }
            }
        }

        if ((user.streak_days) >= 7) {
            await grantAchievement(userId, '7_day_streak', '7 Day Streak 🔥', 'Practiced 7 days in a row!', '🔥', 200)
        }

        return res.status(201).json({ success: true, log, xpEarned, user })
    } catch (error) {
        return sendServerError(res, 'Error in logProgressController', 'Failed to log progress', error)
    }
}

export async function getProgressController(req, res) {
    try {
        const userId = String(req.query.userId || '')
        if (!userId) return res.status(400).json({ error: 'userId required' })
        if (!sameUser(req, userId)) return res.status(403).json({ error: 'Forbidden' })

        const logs = await PracticeLog.find({ user_id: userId }).sort({ practiced_at: -1 }).limit(100).lean()
        const user = await User.findById(userId).lean()
        const achievements = await Achievement.find({ user_id: userId }).sort({ earned_at: -1 }).lean()

        return res.status(200).json({ logs, user, achievements })
    } catch (error) {
        return sendServerError(res, 'Error in getProgressController', 'Failed to get progress', error)
    }
}
