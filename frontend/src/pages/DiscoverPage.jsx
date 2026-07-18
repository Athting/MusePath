import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { useAuth } from '../hooks/useAuth'
import { api } from '../services/api'
import { Bookmark, BookmarkCheck, PlusCircle, Clock, Music, Sparkles, Play, Pause } from 'lucide-react'

const MOODS = ['Chill', 'Fun', 'Intense', 'Relaxed']
const GENRES = ['Blues', 'Indie', 'Pop', 'Rock', 'Jazz', 'Fingerstyle', 'Classical', 'Hip Hop', 'R&B', 'Metal', 'Folk', 'Country']
const LEVELS = ['beginner', 'intermediate', 'advanced']
const INSTRUMENTS = ['guitar', 'piano', 'drums', 'bass', 'vocals', 'violin']

const diffColors = { beginner: 'badge-success', intermediate: 'badge-warning', advanced: 'badge-error' }

function SongCard({ song, userId, onSave, activePreviewUrl, setActivePreviewUrl }) {
    const [saved, setSaved] = useState(false)
    const [saving, setSaving] = useState(false)
    const { addToast } = useStore()

    const isPlaying = song.preview_url && activePreviewUrl === song.preview_url

    const handleAction = async (action) => {
        setSaving(true)
        try {
            await api.saveSong({ userId, song, action })
            setSaved(true)
            addToast(
                action === 'save' ? `"${song.title}" saved! 🎵` :
                    action === 'add_to_plan' ? `Added to your plan! 📚` :
                        `Added to Learn Later list! 🕐`,
                'success'
            )
            if (onSave) onSave()
        } catch (err) {
            addToast('Failed to save song', 'error')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="song-card">
            {/* Art with Play/Pause Overlay */}
            <div
                className="song-art"
                style={{ position: 'relative', cursor: song.preview_url ? 'pointer' : 'default' }}
                onClick={() => {
                    if (song.preview_url) {
                        setActivePreviewUrl(isPlaying ? null : song.preview_url)
                    }
                }}
            >
                {song.album_art ? (
                    <img src={song.album_art} alt={song.title} />
                ) : (
                    <span className="page-style-88">🎵</span>
                )}

                {song.preview_url && (
                    <div
                        className="video-play-overlay"
                        style={{
                            opacity: isPlaying ? 1 : undefined,
                            background: 'rgba(0,0,0,0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'opacity 0.2s ease-in-out'
                        }}
                    >
                        <div className="video-play-btn page-style-89" >
                            {isPlaying ? <Pause size={18} color="#0a0a14" className="page-style-90" /> : <Play size={18} color="#0a0a14" className="page-style-91" />}
                        </div>
                    </div>
                )}
            </div>

            {/* Info */}
            <div>
                <div className="song-title">{song.title}</div>
                <div className="song-artist">{song.artist}</div>
                <div className="flex items-center gap-2 mt-2">
                    <span className={`badge ${diffColors[song.difficulty] || 'badge-muted'}`}>{song.difficulty}</span>
                    {song.estimatedLearningTime && (
                        <span className="page-style-92">
                            <Clock size={11} /> {song.estimatedLearningTime}
                        </span>
                    )}
                </div>
            </div>

            {/* Why */}
            <div className="song-why">{song.whyRecommended}</div>

            {/* Skills */}
            {song.skillsLearned?.length > 0 && (
                <div className="song-skills">
                    {song.skillsLearned.slice(0, 3).map(s => (
                        <span key={s} className="badge badge-accent">{s}</span>
                    ))}
                </div>
            )}

            {/* Fun fact */}
            {song.funFact && (
                <div className="page-style-93">
                    💡 {song.funFact}
                </div>
            )}

            {/* Actions */}
            <div className="song-actions">
                <button onClick={() => handleAction('add_to_plan')} disabled={saving || saved} className="btn btn-primary btn-sm flex-1">
                    <PlusCircle size={12} /> Add to Plan
                </button>
                {song.spotify_url && (
                    <a href={song.spotify_url} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" title="Listen on Spotify">
                        <Music size={12} color="#1DB954" />
                    </a>
                )}
                <button onClick={() => handleAction('save')} disabled={saving || saved} className="btn btn-secondary btn-sm">
                    {saved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                </button>
                <button onClick={() => handleAction('learn_later')} disabled={saving || saved} className="btn btn-secondary btn-sm">
                    <Clock size={12} /> Later
                </button>
            </div>
        </div>
    )
}

export default function DiscoverPage() {
    const { discoverFilters, setDiscoverFilters, addToast } = useStore()
    const { user } = useAuth()
    const [songs, setSongs] = useState([])
    const [loading, setLoading] = useState(false)
    const [hasSearched, setHasSearched] = useState(false)
    const [filters, setFilters] = useState({
        mood: 'Chill', genre: 'Pop', level: 'beginner', instrument: 'guitar'
    })
    const [activePreviewUrl, setActivePreviewUrl] = useState(null)

    useEffect(() => {
        if (activePreviewUrl) {
            const audio = new Audio(activePreviewUrl)
            audio.play().catch(err => {
                console.error('Audio playback failed:', err.message)
                setActivePreviewUrl(null)
            })
            audio.onended = () => {
                setActivePreviewUrl(null)
            }
            return () => {
                audio.pause()
                audio.src = ''
            }
        }
    }, [activePreviewUrl])

    const search = async () => {
        setLoading(true)
        setHasSearched(true)
        try {
            const data = await api.getDiscover({ ...filters, limit: 12 })
            setSongs(data.songs || [])
            setDiscoverFilters(filters)
            if (data.warning) addToast(data.warning, 'info')
        } catch (err) {
            addToast('Failed to get recommendations: ' + err.message, 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="page-content animate-fade-in">
            <div className="page-header">
                <h1 className="page-title">Song Discovery</h1>
                <p className="page-description">Find the perfect songs to learn based on your vibe and skill level.</p>
            </div>

            {/* Filter Card */}
            <div className="card card-padded mb-8">
                <h2 className="page-style-94">
                    🎯 Customize Your Discovery
                </h2>

                <div className="grid-2 page-style-95" >
                    {/* Instrument */}
                    <div className="input-group">
                        <label className="input-label">Instrument</label>
                        <div className="page-style-96">
                            {INSTRUMENTS.map(i => (
                                <button key={i} onClick={() => setFilters(f => ({ ...f, instrument: i }))}
                                    className={`multi-tag ${filters.instrument === i ? 'selected' : ''}`}>
                                    {i.charAt(0).toUpperCase() + i.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Skill Level */}
                    <div className="input-group">
                        <label className="input-label">Skill Level</label>
                        <div className="page-style-97">
                            {LEVELS.map(l => (
                                <button key={l} onClick={() => setFilters(f => ({ ...f, level: l }))}
                                    className={`multi-tag ${filters.level === l ? 'selected' : ''}`}>
                                    {l.charAt(0).toUpperCase() + l.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Mood */}
                    <div className="input-group">
                        <label className="input-label">Mood</label>
                        <div className="page-style-98">
                            {MOODS.map(m => (
                                <button key={m} onClick={() => setFilters(f => ({ ...f, mood: m }))}
                                    className={`multi-tag ${filters.mood === m ? 'selected' : ''}`}>
                                    {m === 'Chill' ? '😌' : m === 'Fun' ? '🎉' : m === 'Intense' ? '💪' : '🌊'} {m}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Genre */}
                    <div className="input-group">
                        <label className="input-label">Genre</label>
                        <div className="page-style-99">
                            {GENRES.map(g => (
                                <button key={g} onClick={() => setFilters(f => ({ ...f, genre: g }))}
                                    className={`multi-tag ${filters.genre === g ? 'selected' : ''}`}>
                                    {g}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <button onClick={search} disabled={loading} className="btn btn-primary btn-lg">
                    {loading ? (
                        <><div className="loading-spinner page-style-100" /> Discovering...</>
                    ) : (
                        <><Sparkles size={18} /> Discover Songs</>
                    )}
                </button>
            </div>

            {/* Results */}
            {loading && (
                <div className="empty-state">
                    <div className="loading-spinner page-style-101" />
                    <div className="page-style-102">Finding perfect songs for you...</div>
                </div>
            )}

            {!loading && hasSearched && songs.length === 0 && (
                <div className="empty-state">
                    <div className="empty-state-icon">🎵</div>
                    <div className="empty-state-title">No songs found</div>
                    <div className="empty-state-desc">Try adjusting your filters and searching again.</div>
                </div>
            )}

            {!loading && songs.length > 0 && (
                <>
                    <div className="section-header">
                        <div>
                            <h2 className="section-title">
                                {songs.length} Songs Found
                            </h2>
                            <p className="section-subtitle">
                                {filters.genre} · {filters.mood} · {filters.level}
                            </p>
                        </div>
                    </div>
                    <div className="grid-auto-fill-300">
                        {songs.map((song, i) => (
                            <SongCard
                                key={i}
                                song={song}
                                userId={user?.id}
                                activePreviewUrl={activePreviewUrl}
                                setActivePreviewUrl={setActivePreviewUrl}
                            />
                        ))}
                    </div>
                </>
            )}

            {!hasSearched && (
                <div className="empty-state page-style-103" >
                    <div className="empty-state-icon">🎸</div>
                    <div className="empty-state-title">Set your filters above</div>
                    <div className="empty-state-desc">Choose your mood, genre, and skill level — then click Discover Songs.</div>
                </div>
            )}
        </div>
    )
}

