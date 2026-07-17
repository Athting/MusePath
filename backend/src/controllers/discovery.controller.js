import { buildVideoQuery, fallbackSongs, fallbackVideos, searchSpotifySongs, searchYouTubeVideos } from '../services/musicApiServices.js'

export async function discoverSongsController(req, res) {
    const instrument = String(req.query.instrument || 'guitar')
    const level = String(req.query.level || 'beginner')
    const mood = String(req.query.mood || 'chill')
    const genre = String(req.query.genre || 'pop')
    const limit = Math.min(Number(req.query.limit || 10), 12)
    const market = String(req.query.market || process.env.SPOTIFY_MARKET || 'IN').toUpperCase()

    try {
        const songs = await searchSpotifySongs({ instrument, level, mood, genre, limit, market })
        return res.status(200).json({ songs, mood, genre, instrument, level, source: 'spotify' })
    } catch (error) {
        console.error('[spotify] Falling back to demo recommendations:', error.message)
        const songs = fallbackSongs({ instrument, level, mood, genre, limit })
        return res.status(200).json({
            songs,
            mood,
            genre,
            instrument,
            level,
            source: 'fallback',
            warning: 'Spotify is temporarily unavailable; showing demo recommendations.'
        })
    }
}

export async function getVideosController(req, res) {
    const instrument = String(req.query.instrument || 'guitar')
    const topic = String(req.query.topic || 'basics')
    const level = String(req.query.level || 'beginner')
    const query = String(req.query.query || '').trim()

    const searchQuery = query || buildVideoQuery(instrument, topic, level)
    try {
        const videos = await searchYouTubeVideos(searchQuery, 8)
        return res.status(200).json({ videos, searchQuery, instrument, topic, level, source: 'youtube' })
    } catch (error) {
        console.error('[youtube] Falling back to search links:', error.message)
        const videos = fallbackVideos(searchQuery, 8)
        return res.status(200).json({
            videos,
            searchQuery,
            instrument,
            topic,
            level,
            source: 'fallback',
            warning: 'YouTube is temporarily unavailable; showing search links.'
        })
    }
}
