import { useEffect, useState } from 'react'
import { useStore } from '../store/useStore'
import { useAuth } from '../hooks/useAuth'
import { api } from '../services/api'
import { Music, Clock, BookOpen, Trophy, Bookmark, User, Edit2, Check } from 'lucide-react'

export default function ProfilePage() {
  const { addToast } = useStore()
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [username, setUsername] = useState('')

  const load = async () => {
    try {
      const data = await api.getProfile(user.id)
      setProfile(data)
      setUsername(data.user?.username || user?.email?.split('@')[0] || '')
    } catch (err) {
      addToast('Failed to load profile', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (user) load() }, [user])

  const saveUsername = async () => {
    try {
      await api.updateProfile({ userId: user.id, username })
      addToast('Profile updated! ✓', 'success')
      setEditing(false)
      load()
    } catch (err) {
      addToast('Failed to update profile', 'error')
    }
  }

  if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>

  const { stats, savedSongs, achievements, plans } = profile || {}
  const userData = profile?.user
  const initials = (username || user?.email || 'MP').slice(0, 2).toUpperCase()
  const activePlan = plans?.find(p => p.is_active)

  return (
    <div className="page-content animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Profile</h1>
        <p className="page-description">Your musical identity and learning stats.</p>
      </div>

      {/* Profile Card */}
      <div className="card card-padded mb-8 page-style-188" >
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <div className="page-style-189">
            {initials}
          </div>

          {/* Info */}
          <div className="page-style-190">
            <div className="flex items-center gap-3 mb-1">
              {editing ? (
                <div className="page-style-191">
                  <input
                    className="input page-style-192"
                    
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && saveUsername()}
                    autoFocus
                  />
                  <button onClick={saveUsername} className="btn btn-primary btn-sm"><Check size={14} /></button>
                  <button onClick={() => setEditing(false)} className="btn btn-secondary btn-sm">Cancel</button>
                </div>
              ) : (
                <>
                  <div className="page-style-193">
                    {username || 'Musician'}
                  </div>
                  <button onClick={() => setEditing(true)} className="btn btn-ghost btn-icon">
                    <Edit2 size={14} />
                  </button>
                </>
              )}
            </div>
            <div className="page-style-194">
              {user?.email}
            </div>
            <div className="chip-row">
              {userData?.instrument && <span className="badge badge-primary">🎸 {userData.instrument}</span>}
              {userData?.skill_level && <span className="badge badge-accent">{userData.skill_level}</span>}
              {userData?.goal_duration && <span className="badge badge-muted">📅 {userData.goal_duration}</span>}
              {userData?.daily_time && <span className="badge badge-muted">⏰ {userData.daily_time}/day</span>}
            </div>
          </div>

          {/* XP Level */}
          <div className="page-style-195">
            <div className="page-style-196">⭐</div>
            <div className="page-style-197">
              {Math.floor((userData?.xp || 0) / 500) + 1}
            </div>
            <div className="page-style-198">Level</div>
            <div className="page-style-199">{userData?.xp || 0} XP</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid-4 mb-8">
        {[
          { icon: '⏱️', label: 'Practice Time', value: `${stats?.totalHours || 0}h`, sub: `${stats?.totalMinutes || 0} min total` },
          { icon: '📚', label: 'Sessions', value: stats?.totalSessions || 0, sub: 'Practice sessions' },
          { icon: '🎵', label: 'Saved Songs', value: stats?.savedSongsCount || 0, sub: 'In your library' },
          { icon: '🏆', label: 'Achievements', value: stats?.achievementsCount || 0, sub: 'Badges earned' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="page-style-200">{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div>
              <div className="page-style-201">{s.label}</div>
              <div className="page-style-202">{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Music Interests */}
      {userData?.music_interests?.length > 0 && (
        <div className="card card-padded mb-8">
          <h2 className="page-style-203">
            🎵 Music Interests
          </h2>
          <div className="chip-row">
            {userData.music_interests.map(g => <span key={g} className="badge badge-primary">{g}</span>)}
          </div>
        </div>
      )}

      {/* Active Plan */}
      {activePlan && (
        <div className="card card-padded mb-8">
          <h2 className="page-style-204">
            🗺️ Active Plan
          </h2>
          <div className="page-style-205">{activePlan.title}</div>
          <p className="page-style-206">{activePlan.summary}</p>
          <div className="chip-row">
            <span className="badge badge-primary">{activePlan.instrument}</span>
            <span className="badge badge-accent">{activePlan.skill_level}</span>
            <span className="badge badge-muted">{activePlan.goal_duration}</span>
          </div>
        </div>
      )}

      {/* Saved Songs */}
      {savedSongs?.length > 0 && (
        <div className="mb-8">
          <div className="section-header">
            <h2 className="section-title">Saved Songs ({savedSongs.length})</h2>
          </div>
          <div className="page-style-207">
            {savedSongs.map((s, i) => (
              <div key={i} className="card page-style-208" >
                <div className="page-style-209">🎵</div>
                <div className="page-style-210">
                  <div className="page-style-211">{s.song_title}</div>
                  <div className="page-style-212">by {s.song_artist}</div>
                </div>
                <div className="flex items-center gap-2">
                  {s.difficulty && <span className="badge badge-muted">{s.difficulty}</span>}
                  <span className="badge badge-accent">{s.action?.replace('_', ' ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievements */}
      {achievements?.length > 0 && (
        <div>
          <div className="section-header">
            <h2 className="section-title">Achievements</h2>
          </div>
          <div className="grid-auto-fill-260">
            {achievements.map((a, i) => (
              <div key={i} className="achievement-badge">
                <div className="achievement-icon">{a.icon}</div>
                <div className="achievement-title">{a.title}</div>
                <div className="achievement-desc">{a.description}</div>
                <div className="badge badge-accent">+{a.xp_reward} XP</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

