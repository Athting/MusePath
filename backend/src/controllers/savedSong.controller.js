import { SavedSong } from '../models/SavedSong.js'
import { grantAchievement } from './achievement.controller.js'
import { sameUser, sendServerError } from './controller.helpers.js'

export async function saveSongController(req, res) {
    try {
        const { userId, song, action = 'save' } = req.body || {}
        if (!userId || !song?.title || !song?.artist) {
            return res.status(400).json({ error: 'userId and song (title, artist) required' })
        }
        if (!sameUser(req, userId)) return res.status(403).json({ error: 'Forbidden' })

        const savedSong = await SavedSong.findOneAndUpdate(
            { user_id: userId, song_title: song.title.trim(), song_artist: song.artist.trim() },
            {
                $set: {
                    difficulty: song.difficulty || '',
                    genre: song.genre || '',
                    why_recommended: song.whyRecommended || '',
                    skills_learned: song.skillsLearned || [],
                    action
                },
                $setOnInsert: {
                    user_id: userId,
                    song_title: song.title.trim(),
                    song_artist: song.artist.trim()
                }
            },
            { upsert: true, new: true }
        )

        await grantAchievement(userId, 'first_song_saved', 'Song Collector!', 'Saved your first song to learn', '🎵', 50)

        return res.status(201).json({ success: true, savedSong })
    } catch (error) {
        return sendServerError(res, 'Error in saveSongController', 'Failed to save song', error)
    }
}

export async function deleteSavedSongController(req, res) {
    try {
        const { userId, songTitle, songArtist } = req.body || {}
        if (!userId || !songTitle || !songArtist) {
            return res.status(400).json({ 
                error: 'userId, songTitle, and songArtist required' 
            })
        }
        if (!sameUser(req, userId)) return res.status(403).json({ 
            error: 'Forbidden' 
        })

        await SavedSong.deleteOne({ user_id: userId, song_title: songTitle.trim(), song_artist: songArtist.trim() })
        return res.status(200).json({ success: true })
    } catch (error) {
        return sendServerError(res, 'Error in deleteSavedSongController', 'Failed to delete song', error)
    }
}
