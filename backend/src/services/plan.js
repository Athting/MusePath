export function monthsFromDuration(duration) {
    if (!duration) return 3
    const d = String(duration).toLowerCase()
    if (d.includes('1 month')) return 1
    if (d.includes('3 months')) return 3
    if (d.includes('6 months')) return 6
    if (d.includes('1 year')) return 12
    return 3
}

export function makeFallbackPlan({ instrument, level, duration, dailyTime, interests = [], mood = 'Chill' }) {
    const totalMonths = monthsFromDuration(duration)
    const interestList = interests.length ? interests : ['Pop']

    const months = Array.from({ length: totalMonths }).map((_, mi) => {
        const monthNumber = mi + 1
        const weeks = Array.from({ length: 4 }).map((__, wi) => {
            const weekNumber = wi + 1
            return {
                weekNumber,
                title: `${instrument} Week ${weekNumber} Essentials`,
                topics: [
                    `${instrument} fundamentals`,
                    `${interestList[mi % interestList.length]} groove practice`
                ],
                skills: [
                    'Rhythm control',
                    'Technique consistency'
                ],
                practiceGoal: `Practice ${dailyTime} daily with focus on timing and clean execution.`,
                practiceMinutes: parseInt(String(dailyTime)) || 20,
                songs: [
                    {
                        title: `Practice Track ${monthNumber}-${weekNumber}`,
                        artist: 'MusePath Session Band',
                        difficulty: level,
                        whyRecommended: `Supports ${mood} learning and improves core ${instrument} control.`,
                        skillsLearned: ['Timing', 'Coordination']
                    }
                ],
                youtubeSearches: [`${instrument} ${level} week ${weekNumber} lesson`],
                milestone: `Play one complete song section with steady timing.`
            }
        })

        return {
            monthNumber,
            theme: `${level} ${instrument} growth`,
            overview: `Build confidence and technique in month ${monthNumber}.`,
            monthlyMilestone: `Perform a complete practice piece at month ${monthNumber} level.`,
            weeks
        }
    })

    return {
        title: `${instrument[0].toUpperCase() + instrument.slice(1)} ${duration} Roadmap`,
        summary: `A personalized ${totalMonths}-month plan tailored to your ${level} level and ${mood} vibe.`,
        totalMonths,
        months,
        tips: [
            'Practice daily in short focused sessions.',
            'Record yourself weekly to track progress.',
            'Prioritize clean timing over speed.'
        ],
        motivationalMessage: 'Small daily reps create big musical breakthroughs. Keep going!'
    }
}
