import { Achievement } from '../models/Achievement.js'
import { User } from '../models/User.js'

/**
 * Grants an achievement to a user if they have not already earned it.
 * Creates the achievement document only if it does not already exist.
 * When a new achievement is awarded, the user's XP is increased by
 * the specified reward amount.
 *
 * @async
 * @param {string} userId - MongoDB ObjectId of the user.
 * @param {string} key - Unique achievement identifier.
 * @param {string} title - Achievement title.
 * @param {string} description - Achievement description.
 * @param {string} icon - Icon representing the achievement.
 * @param {number} xpReward - XP awarded for earning the achievement.
 * @returns {Promise<boolean>} Returns `true` if a new achievement was granted,
 * otherwise `false` if the user already had it.
 */

export async function grantAchievement(userId, key, title, description, icon, xpReward) {
    const result = await Achievement.updateOne(
        { user_id: userId, achievement_key: key },
        {
            $setOnInsert: {
                user_id: userId,
                achievement_key: key,
                title,
                description,
                icon,
                xp_reward: xpReward,
                xp_granted: true,
                earned_at: new Date()
            }
        },
        { upsert: true }
    )

    if (result.upsertedCount) {
        await User.updateOne({ _id: userId }, { $inc: { xp: xpReward } })
    }

    return Boolean(result.upsertedCount)
}

