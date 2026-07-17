import { monthsFromDuration } from './plan.js'

const API_ROOT = 'https://generativelanguage.googleapis.com/v1beta/models'
const stringArray = { type: 'ARRAY', items: { type: 'STRING' } }
const songSchema = {
    type: 'OBJECT',
    properties: {
        title: { type: 'STRING' }, artist: { type: 'STRING' }, difficulty: { type: 'STRING' },
        whyRecommended: { type: 'STRING' }, skillsLearned: stringArray
    },
    required: ['title', 'artist', 'difficulty', 'whyRecommended', 'skillsLearned']
}
const weekSchema = {
    type: 'OBJECT',
    properties: {
        weekNumber: { type: 'INTEGER' }, title: { type: 'STRING' }, topics: stringArray, skills: stringArray,
        practiceGoal: { type: 'STRING' }, practiceMinutes: { type: 'INTEGER' },
        songs: { type: 'ARRAY', items: songSchema }, youtubeSearches: stringArray, milestone: { type: 'STRING' }
    },
    required: ['weekNumber', 'title', 'topics', 'skills', 'practiceGoal', 'practiceMinutes', 'songs', 'youtubeSearches', 'milestone']
}
const planSchema = {
    type: 'OBJECT',
    properties: {
        title: { type: 'STRING' }, summary: { type: 'STRING' }, totalMonths: { type: 'INTEGER' },
        months: {
            type: 'ARRAY',
            items: {
                type: 'OBJECT',
                properties: {
                    monthNumber: { type: 'INTEGER' }, theme: { type: 'STRING' }, overview: { type: 'STRING' },
                    monthlyMilestone: { type: 'STRING' }, weeks: { type: 'ARRAY', items: weekSchema }
                },
                required: ['monthNumber', 'theme', 'overview', 'monthlyMilestone', 'weeks']
            }
        },
        tips: stringArray, motivationalMessage: { type: 'STRING' }
    },
    required: ['title', 'summary', 'totalMonths', 'months', 'tips', 'motivationalMessage']
}

async function responseData(response) {
    const text = await response.text()
    if (!text) return {}
    try { 
        return JSON.parse(text) 
    } catch { 
        return { message: text } 
    }
}

function validatePlan(plan, expectedMonths) {
    if (!plan || !Array.isArray(plan.months) || plan.months.length !== expectedMonths) {
        throw new Error(`Gemini must return exactly ${expectedMonths} months`)
    }
    if (plan.months.some(month => !Array.isArray(month.weeks) || month.weeks.length !== 4)) {
        throw new Error('Gemini must return exactly four weeks per month')
    }
    plan.totalMonths = expectedMonths
    return plan
}

export async function generateLearningPlan({ instrument, level, duration, dailyTime, interests = [], mood = 'Chill' }) {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) throw new Error('GEMINI_API_KEY is not configured')

    const model = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite'
    const totalMonths = monthsFromDuration(duration)
    const prompt = [
        'Create a practical, progressive music-learning roadmap.',
        `Instrument: ${instrument}; level: ${level}; duration: ${duration}; daily practice: ${dailyTime}.`,
        `Music interests: ${interests.join(', ') || 'general'}; preferred mood: ${mood}.`,
        `Return exactly ${totalMonths} months and exactly 4 weeks per month.`,
        'Recommend real, level-appropriate songs. youtubeSearches must contain search phrases, never URLs.',
        'Keep all guidance concise, specific, safe, and actionable.'
    ].join('\n')

    const response = await fetch(`${API_ROOT}/${encodeURIComponent(model)}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: 'application/json',
                responseSchema: planSchema,
                temperature: 0.7,
                maxOutputTokens: 32768
            }
        })
    })
    const data = await responseData(response)
    if (!response.ok) throw new Error(data.error?.message || data.message || `Gemini request failed (${response.status})`)
    const text = data.candidates?.[0]?.content?.parts?.map(part => part.text || '').join('')
    if (!text) throw new Error('Gemini returned no plan content')
    return validatePlan(JSON.parse(text), totalMonths)
}
