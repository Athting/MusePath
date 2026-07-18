import { useEffect, useState } from 'react'
import { useStore } from '../store/useStore'
import { useAuth } from '../hooks/useAuth'
import { api } from '../services/api'
import { Flame, Clock, Star, CheckSquare, Trophy, Calendar, Plus } from 'lucide-react'
import Heatmap from '../components/progress/Heatmap'
import LogPracticeModal from '../components/progress/LogPracticeModal'

export default function ProgressPage() {
  const { addToast } = useStore()
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [dashData, setDashData] = useState(null)

  const load = async () => {
    try {
      const [prog, dash] = await Promise.all([
        api.getProgress(user.id),
        api.getDashboard(user.id)
      ])
      setData(prog)
      setDashData(dash)
    } catch (err) {
      addToast('Failed to load progress', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (user) load() }, [user])

  if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>

  const streak = data?.user?.streak_days || 0
  const totalMins = data?.user?.total_practice_minutes || 0
  const xp = data?.user?.xp || 0
  const level = Math.floor(xp / 500) + 1
  const xpProgress = (xp % 500) / 500 * 100

  const achievements = data?.achievements || []
  const logs = data?.logs || []

  return (
    <div className="page-content animate-fade-in">
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Your Progress</h1>
            <p className="page-description">Track your musical journey, streaks, and achievements.</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            <Plus size={16} />
            Log Practice
          </button>
        </div>
      </div>

      {showModal && (
        <LogPracticeModal
          userId={user.id}
          planId={dashData?.plan?.id}
          onClose={() => setShowModal(false)}
          onSuccess={load}
        />
      )}

      {/* Stats Grid */}
      <div className="grid-4 mb-8">
        {[
          { icon: '🔥', label: 'Day Streak', value: streak, sub: streak > 0 ? 'On fire!' : 'Start today', bg: 'var(--warning-glow)' },
          { icon: '⏱️', label: 'Total Time', value: `${Math.round(totalMins/60)}h`, sub: `${totalMins} minutes`, bg: 'var(--primary-glow)' },
          { icon: '⭐', label: 'Total XP', value: xp, sub: `Level ${level}`, bg: 'var(--accent-glow)' },
          { icon: '🏆', label: 'Achievements', value: achievements.length, sub: 'Badges earned', bg: 'var(--success-glow)' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg, fontSize: '1.4rem' }}>{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div>
              <div className="page-style-213">{s.label}</div>
              <div className="page-style-214">{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Streak display */}
      <div className="card card-padded mb-8">
        <div className="streak-display">
          <span className="streak-flame">🔥</span>
          <div>
            <div className="streak-count">{streak}</div>
            <div className="streak-label">Day{streak !== 1 ? 's' : ''} in a row</div>
          </div>
          <div className="page-style-215">
            <div className="page-style-216">Level {level}</div>
            <div className="page-style-217">{xp} XP</div>
          </div>
        </div>
        <div className="xp-bar mt-4">
          <div className="xp-bar-fill" style={{ width: `${xpProgress}%` }} />
        </div>
        <div className="page-style-218">
          <span>Level {level}</span>
          <span>{500 - (xp % 500)} XP to Level {level + 1}</span>
        </div>
      </div>

      {/* Practice Heatmap */}
      <div className="card card-padded mb-8">
        <h2 className="page-style-219">
          Practice Heatmap
        </h2>
        <p className="page-style-220">
          Your practice activity over the past year
        </p>
        {logs.length > 0 ? (
          <Heatmap logs={logs} />
        ) : (
          <div className="page-style-221">
            No practice sessions yet. Start logging! 🎸
          </div>
        )}
      </div>

      {/* Achievements */}
      <div className="mb-8">
        <div className="section-header">
          <div>
            <h2 className="section-title">Achievements</h2>
            <p className="section-subtitle">Milestones you've unlocked</p>
          </div>
        </div>
        {achievements.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🏆</div>
            <div className="empty-state-title">No achievements yet</div>
            <div className="empty-state-desc">Complete lessons and build streaks to earn badges!</div>
          </div>
        ) : (
          <div className="grid-auto-fill-260">
            {achievements.map((a, i) => (
              <div key={i} className="achievement-badge">
                <div className="achievement-icon">{a.icon}</div>
                <div className="achievement-title">{a.title}</div>
                <div className="achievement-desc">{a.description}</div>
                <div className="badge badge-accent">+{a.xp_reward} XP</div>
                <div className="page-style-222">
                  {new Date(a.earned_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Sessions */}
      <div>
        <div className="section-header">
          <h2 className="section-title">Recent Practice Sessions</h2>
        </div>
        {logs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <div className="empty-state-title">No sessions logged</div>
            <div className="empty-state-desc">Click "Log Practice" to record your first session.</div>
          </div>
        ) : (
          <div className="page-style-223">
            {logs.slice(0, 15).map((log, i) => (
              <div key={i} className="card page-style-224" >
                <div className="page-style-225">🎵</div>
                <div className="page-style-226">
                  <div className="page-style-227">
                    {log.duration_minutes} minute session
                  </div>
                  {log.notes && <div className="page-style-228">{log.notes}</div>}
                </div>
                <div className="page-style-229">
                  {log.mood && <div className="badge badge-muted mb-1">{log.mood}</div>}
                  <div className="page-style-230">
                    {new Date(log.practiced_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}



