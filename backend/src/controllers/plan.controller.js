import { LearningPlan } from '../models/LearningPlan.js'
import { LearningWeek } from '../models/LearningWeek.js'
import { Progress } from '../models/Progress.js'
import { User } from '../models/User.js'
import { generateLearningPlan } from '../services/gemini.js'
import { makeFallbackPlan } from '../services/plan.js'
import { grantAchievement } from './achievement.controller.js'
import { sameUser, sendServerError, withId } from './controller.helpers.js'

export async function generatePlanController(req, res) {
    try {
        const { userId, instrument, level, duration, dailyTime, interests = [], mood = 'Chill' } = req.body || {}
        if (!userId || !instrument || !level || !duration || !dailyTime || !Array.isArray(interests)) {
            return res.status(400).json({ error: 'Missing required fields' })
        }
        if (!sameUser(req, userId)) return res.status(403).json({ error: 'Forbidden' })

        const user = await User.findById(userId)
        if (!user) return res.status(404).json({ error: 'User not found' })

        let planData
        let planSource = 'gemini'
        try {
            planData = await generateLearningPlan({ instrument, level, duration, dailyTime, interests, mood })
        } catch (error) {
            console.error('[gemini] Falling back to generated template:', error.message)
            planData = makeFallbackPlan({ instrument, level, duration, dailyTime, interests, mood })
            planSource = 'fallback'
        }

        await LearningPlan.updateMany({ user_id: userId }, { $set: { is_active: false } })

        const plan = await LearningPlan.create({
            user_id: userId,
            title: planData.title,
            summary: planData.summary,
            instrument,
            skill_level: level,
            goal_duration: duration,
            daily_time: dailyTime,
            music_interests: interests,
            learning_mood: mood,
            total_months: planData.totalMonths,
            plan_data: planData,
            tips: planData.tips || [],
            motivational_message: planData.motivationalMessage || '',
            is_active: true
        })

        const weeks = []
        for (const month of planData.months || []) {
            for (const week of month.weeks || []) {
                weeks.push({
                    plan_id: plan._id.toString(),
                    user_id: userId,
                    month_number: month.monthNumber,
                    week_number: week.weekNumber,
                    title: week.title || '',
                    topics: week.topics || [],
                    skills: week.skills || [],
                    practice_goal: week.practiceGoal || '',
                    practice_minutes: week.practiceMinutes || 20,
                    milestone: week.milestone || '',
                    youtube_searches: week.youtubeSearches || [],
                    is_completed: false
                })
            }
        }
        if (weeks.length) await LearningWeek.insertMany(weeks)

        user.instrument = instrument
        user.skill_level = level
        user.goal_duration = duration
        user.daily_time = dailyTime
        user.music_interests = interests
        user.learning_mood = mood
        await user.save()

        await Progress.updateOne(
            { user_id: userId, plan_id: plan._id.toString() },
            {
                $set: {
                    month_number: 1,
                    total_weeks: weeks.length,
                    completed_weeks: 0,
                    completion_percentage: 0,
                    xp_earned: user.xp || 0
                }
            },
            { upsert: true }
        )

        await grantAchievement(userId, 'first_plan', 'Journey Begins!', 'Created your first learning plan', '🗺️', 100)

        return res.status(201).json({
            success: true,
            plan: withId(plan),
            planData,
            source: planSource,
            ...(planSource === 'fallback' ? { warning: 'Gemini is temporarily unavailable; a template plan was created.' } : {})
        })
    } catch (error) {
        return sendServerError(res, 'Error in generatePlanController', 'Failed to generate plan', error)
    }
}

export async function getPlansController(req, res) {
    try {
        const userId = String(req.query.userId || '')
        if (!userId) return res.status(400).json({ error: 'userId required' })
        if (!sameUser(req, userId)) return res.status(403).json({ error: 'Forbidden' })

        const plans = await LearningPlan.find({ user_id: userId }).sort({ createdAt: -1 }).lean()
        return res.status(200).json(plans.map(withId))
    } catch (error) {
        return sendServerError(res, 'Error in getPlansController', 'Failed to retrieve plans', error)
    }
}

export async function setActivePlanController(req, res) {
    try {
        const { userId, planId } = req.body || {}
        if (!userId || !planId) return res.status(400).json({ error: 'userId and planId required' })
        if (!sameUser(req, userId)) return res.status(403).json({ error: 'Forbidden' })

        const plan = await LearningPlan.findOne({ _id: planId, user_id: userId })
        if (!plan) return res.status(404).json({ error: 'Plan not found or does not belong to user' })

        await LearningPlan.updateMany({ user_id: userId }, { $set: { is_active: false } })
        plan.is_active = true
        await plan.save()

        await User.findByIdAndUpdate(userId, {
            $set: {
                instrument: plan.instrument,
                skill_level: plan.skill_level,
                goal_duration: plan.goal_duration,
                daily_time: plan.daily_time,
                learning_mood: plan.learning_mood
            }
        })

        return res.status(200).json({ success: true, plan })
    } catch (error) {
        return sendServerError(res, 'Error in setActivePlanController', 'Failed to update active plan', error)
    }
}
