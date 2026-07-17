const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token'
const SPOTIFY_SEARCH_URL = 'https://api.spotify.com/v1/search'
const YOUTUBE_API_ROOT = 'https://www.googleapis.com/youtube/v3'

let spotifyToken = ''
let spotifyTokenExpiresAt = 0

// Network helpers
async function spotifyFetch(url, options = {}) {
    return fetch(url, options)
}

async function readSpotifyResponse(response) {
    const text = await response.text()
    if (!text) return {}

    try {
        return JSON.parse(text)
    } catch {
        return { message: text }
    }
}

async function getSpotifyAccessToken() {
    const clientId = process.env.SPOTIFY_CLIENT_ID
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

    if (!clientId || !clientSecret) {
        throw new Error('Spotify credentials are not configured')
    }

    if (spotifyToken && Date.now() < spotifyTokenExpiresAt) return spotifyToken

    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
    const response = await spotifyFetch(SPOTIFY_TOKEN_URL, {
        method: 'POST',
        headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({ grant_type: 'client_credentials' })
    })
    const data = await readSpotifyResponse(response)

    if (!response.ok || !data.access_token) {
        throw new Error(data.error_description || data.error?.message || data.message || `Spotify authentication failed (${response.status})`)
    }

    spotifyToken = data.access_token
    // Refresh one minute early so requests do not race an expiring token.
    spotifyTokenExpiresAt = Date.now() + Math.max((Number(data.expires_in) - 60) * 1000, 60000)
    return spotifyToken
}

// Data transformers and utilities
function learningTime(level) {
    if (level === 'advanced') return '3-4 weeks'
    if (level === 'intermediate') return '2-3 weeks'
    return '1-2 weeks'
}

function spotifyTrackToSong(track, { instrument, level, mood, genre }) {
    const artists = (track.artists || []).map(artist => artist.name).filter(Boolean)

    return {
        title: track.name || 'Untitled track',
        artist: artists.join(', ') || 'Unknown artist',
        difficulty: level,
        whyRecommended: `A ${genre} track for ${mood.toLowerCase()} ${instrument} practice.`,
        skillsLearned: ['Rhythm', 'Timing', 'Musicality'],
        genre,
        mood,
        estimatedLearningTime: learningTime(level),
        funFact: track.album?.name ? `Featured on “${track.album.name}”.` : '',
        spotify_url: track.external_urls?.spotify || '',
        preview_url: track.preview_url || '',
        album_art: track.album?.images?.[0]?.url || '',
        spotify_id: track.id || ''
    }
}

function decodeHtml(text = '') {
    return text.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
}

function formatYouTubeDuration(value = '') {
    const match = value.match(/^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/)
    if (!match) return ''
    const hours = Number(match[2] || 0) + Number(match[1] || 0) * 24
    const minutes = Number(match[3] || 0)
    const seconds = Number(match[4] || 0)
    return hours
        ? `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        : `${minutes}:${String(seconds).padStart(2, '0')}`
}

export function buildVideoQuery(instrument = 'guitar', topic = 'basics', level = 'beginner') {
    const levelMap = {
        beginner: 'for beginners',
        intermediate: 'tutorial',
        advanced: 'advanced lesson'
    }
    return `${instrument} ${topic} ${levelMap[level] || 'tutorial'} lesson`
}

export async function searchSpotifySongs({ instrument, level, mood, genre, limit = 10, market = 'IN' }) {
    const size = Math.min(Math.max(Number(limit) || 10, 1), 20)
    const token = await getSpotifyAccessToken()
    const tracks = []

    for (let offset = 0; offset < size; offset += 10) {
        const safeGenre = String(genre).replace(/["\\]/g, ' ').trim()
        const params = new URLSearchParams({
            q: `genre:"${safeGenre}"`,
            type: 'track',
            market,
            limit: String(Math.min(10, size - offset)),
            offset: String(offset)
        })
        const response = await spotifyFetch(`${SPOTIFY_SEARCH_URL}?${params}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        const data = await readSpotifyResponse(response)

        if (!response.ok) {
            throw new Error(data.error?.message || data.message || `Spotify search failed (${response.status})`)
        }

        const page = data.tracks?.items || []
        tracks.push(...page)
        if (page.length < Number(params.get('limit'))) break
    }

    return tracks.slice(0, size).map(track =>
        spotifyTrackToSong(track, { instrument, level, mood, genre })
    )
}

export async function searchYouTubeVideos(query, max = 8) {
    const apiKey = process.env.YOUTUBE_API_KEY
    if (!apiKey) throw new Error('YOUTUBE_API_KEY is not configured')

    const searchParams = new URLSearchParams({
        key: apiKey, part: 'snippet', type: 'video', q: query,
        maxResults: String(Math.min(Math.max(Number(max) || 8, 1), 25)),
        order: 'relevance', safeSearch: 'moderate', videoEmbeddable: 'true'
    })
    const searchResponse = await spotifyFetch(`${YOUTUBE_API_ROOT}/search?${searchParams}`)
    const searchData = await readSpotifyResponse(searchResponse)
    if (!searchResponse.ok) {
        throw new Error(searchData.error?.message || searchData.message || `YouTube search failed (${searchResponse.status})`)
    }

    const ids = (searchData.items || []).map(item => item.id?.videoId).filter(Boolean)
    if (!ids.length) return []
    const detailParams = new URLSearchParams({
        key: apiKey, part: 'snippet,contentDetails,statistics', id: ids.join(',')
    })
    const detailResponse = await spotifyFetch(`${YOUTUBE_API_ROOT}/videos?${detailParams}`)
    const detailData = await readSpotifyResponse(detailResponse)
    if (!detailResponse.ok) {
        throw new Error(detailData.error?.message || detailData.message || `YouTube details failed (${detailResponse.status})`)
    }

    const byId = new Map((detailData.items || []).map(item => [item.id, item]))
    return ids.map(id => byId.get(id)).filter(Boolean).map(video => ({
        youtube_id: video.id,
        title: decodeHtml(video.snippet?.title || 'YouTube lesson'),
        channel: decodeHtml(video.snippet?.channelTitle || 'YouTube'),
        thumbnail: video.snippet?.thumbnails?.high?.url || video.snippet?.thumbnails?.medium?.url || '',
        duration: formatYouTubeDuration(video.contentDetails?.duration),
        view_count: Number(video.statistics?.viewCount || 0),
        watch_url: `https://www.youtube.com/watch?v=${video.id}`,
        description: decodeHtml(video.snippet?.description || '')
    }))
}

// Fallback data
export function fallbackSongs({ instrument, level, mood, genre, limit = 10 }) {
    const size = Math.min(Math.max(Number(limit) || 10, 1), 12)
    return Array.from({ length: size }).map((_, i) => ({
        title: `${genre} Groove ${i + 1}`,
        artist: `${instrument.toUpperCase()} Studio`,
        difficulty: level,
        whyRecommended: `Great for ${mood} practice while improving control and groove.`,
        skillsLearned: ['Rhythm', 'Timing', 'Coordination'],
        genre,
        mood,
        estimatedLearningTime: '1-2 weeks',
        funFact: 'Consistent repetition turns this into a confidence booster.',
        spotify_url: '',
        preview_url: '',
        album_art: '',
        spotify_id: ''
    }))
}

export function fallbackVideos(query, max = 8) {
    return Array.from({ length: max }).map((_, i) => ({
        youtube_id: `demo-${i + 1}`,
        title: `${query} tutorial #${i + 1}`,
        channel: 'MusePath Lessons',
        thumbnail: '',
        duration: '10:00',
        view_count: 0,
        watch_url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
        description: 'Search results on YouTube for this lesson topic.'
    }))
}
