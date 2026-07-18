import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { useAuth } from '../hooks/useAuth'
import { api } from '../services/api'
import { Flame, Clock, Star, Map, Compass, PlayCircle, TrendingUp, ArrowRight, CheckCircle, BookOpen, Sparkles } from 'lucide-react'

function getGreeting() {
    const h = new Date().getHours()
    if (h < 12) return '☀️ Good morning'
    if (h < 17) return '⚡ Good afternoon'
    return '🌙 Good evening'
}

function XPLevel(xp) {
    const level = Math.floor(xp / 500) + 1
    const progress = (xp % 500) / 500 * 100
    const nextXP = (Math.floor(xp / 500) + 1) * 500
    return { level, progress, nextXP }
}

export default function DashboardPage() {
    const { addToast } = useStore()
    const { user } = useAuth()
    const [data, setData] = useState(null)
    const [plans, setPlans] = useState([])
    const [switching, setSwitching] = useState(false)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    const loadDashboard = async () => {
        try {
            const dashData = await api.getDashboard(user.id)
            setData(dashData)
            const plansData = await api.getPlans(user.id)
            setPlans(plansData || [])
        } catch (err) {
            addToast('Failed to load dashboard', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleSwitchPlan = async (planId) => {
        if (!planId || planId === (data?.plan?.id || data?.plan?._id)) return
        setSwitching(true)
        try {
            await api.setActivePlan({ userId: user.id, planId })
            addToast('Active plan switched successfully! 🎸', 'success')
            await loadDashboard()
        } catch (err) {
            addToast('Failed to switch active plan: ' + err.message, 'error')
        } finally {
            setSwitching(false)
        }
    }

    useEffect(() => {
            if (user) loadDashboard()
        }, 
    [user])

    if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>

    const hasPlan = !!data?.plan
    const { level, progress: xpProgress, nextXP } = XPLevel(data?.xp || 0)
    const displayName = user?.user_metadata?.username || user?.username || user?.email?.split('@')[0] || 'Musician'
    const streak = data?.streak || 0
    const totalMinutes = data?.totalMinutes || 0

    return (
        <div className="page-content animate-fade-in page-style-30" >
            {/* Greeting */}
            <div className="dashboard-greeting page-style-31" >
                <h1 className="greeting-text page-style-32" >
                    {getGreeting()}, {displayName}!
                </h1>
                <p className="greeting-sub page-style-33" > {hasPlan ? `TRACKING RIFFS — ON A ${streak}-DAY STREAK!` : "READY TO START YOUR LEARNING PLAN?"} </p>
            </div>

            {/* Plans Manager Bar */}
            {plans.length > 0 && (
                <div className="page-style-34">
                    <div className="flex items-center gap-3 page-style-35" >
                        <span className="page-style-36">
                            Active Plan:
                        </span>
                        <select
                            value={data?.plan?.id || data?.plan?._id || ''}
                            onChange={(e) => handleSwitchPlan(e.target.value)}
                            disabled={switching}
                            className="plan-select"
                        >
                            <option value="" disabled className="page-style-37">-- Select a Plan --</option>
                            {plans.map(p => (
                                <option key={p.id || p._id} value={p.id || p._id} className="page-style-38">
                                    {p.instrument.toUpperCase()} ({p.skill_level.toUpperCase()}) — {p.title || 'Untitled Plan'}
                                </option>
                            ))}
                        </select>
                        {switching && <span className="page-style-39">Switching...</span>}
                    </div>
                    <button onClick={() => navigate('/onboarding')} className="btn btn-secondary btn-sm page-style-40">
                        <Sparkles size={12} className="page-style-41" />
                        Create New Plan
                    </button>
                </div>
            )}

            {/* No plan CTA */}
            {!hasPlan && (
                <div className="card card-padded page-style-42" >
                    <div className="page-style-43">🎸</div>
                    <h2 className="page-style-44">
                        READY TO START YOUR JOURNEY?
                    </h2>
                    <p className="page-style-45">
                        Get your AI-generated music learning plan in seconds.
                    </p>
                    <button onClick={() => navigate('/onboarding')} className="btn btn-primary btn-lg page-style-46" >
                        <Sparkles size={14} className="page-style-47" />
                        Generate My Plan
                    </button>
                </div>
            )}

            {/* Stats Row */}
            <div className="grid-4 mb-8">
                {[
                    { icon: <Flame size={20} color="#ffffff" />, label: 'Day Streak', value: streak, sub: streak > 0 ? 'KEEP IT UP!' : 'START TODAY!', color: '#111111' },
                    { icon: <Clock size={20} color="#ffffff" />, label: 'Practice Time', value: `${Math.round(totalMinutes / 60)}h`, sub: `${totalMinutes} minutes total`, color: '#111111' },
                    { icon: <Star size={20} color="#ffffff" />, label: 'XP Points', value: data?.xp || 0, sub: `Level ${level} • ${nextXP - (data?.xp || 0)} to next`, color: '#111111' },
                    { icon: <CheckCircle size={20} color="#ffffff" />, label: 'Weeks Done', value: data?.progress?.completed_weeks || 0, sub: `of ${data?.progress?.total_weeks || 0} total`, color: '#111111' },
                ].map(s => (
                    <div key={s.label} className="stat-card card page-style-48" >
                        <div className="stat-icon" style={{ background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #333333', borderRadius: 0 }}>{s.icon}</div>
                        <div className="stat-value page-style-49" >{s.value}</div>
                        <div>
                            <div className="page-style-50">{s.label}</div>
                            <div className="page-style-51">{s.sub}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* XP Bar */}
            <div className="card card-padded mb-8 page-style-52" >
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <span className="page-style-53">Level {level}</span>
                        <span className="page-style-54">Musician</span>
                    </div>
                    <span className="page-style-55">{data?.xp || 0} / {nextXP} XP</span>
                </div>
                <div className="xp-bar page-style-56" >
                    <div className="xp-bar-fill" style={{ width: `${xpProgress}%`, height: '100%', background: '#ffffff', borderRadius: 0 }} />
                </div>
            </div>

            {/* Continue Learning */}
            {hasPlan && data?.currentWeek && (
                <div className="card card-padded mb-8 page-style-57" >
                    <div className="page-style-58">🎸</div>
                    <div className="page-style-59">
                        <div className="page-style-60">
                            Month {data.currentWeek.month_number} · Week {data.currentWeek.week_number}
                        </div>
                        <div className="page-style-61">
                            {data.currentWeek.title}
                        </div>
                        <div className="page-style-62">
                            {data.currentWeek.practice_goal}
                        </div>
                    </div>
                    <Link to="/plan" className="btn btn-primary page-style-63" >
                        CONTINUE
                    </Link>
                </div>
            )}

            {/* Quick Actions */}
            <div className="grid-2 mb-8">
                {[
                    { icon: <Map size={20} color="#ffffff" />, label: 'My Plan', desc: 'View your full roadmap', to: '/plan', color: '#111111' },
                    { icon: <Compass size={20} color="#ffffff" />, label: 'Discover', desc: 'Find songs to learn', to: '/discover', color: '#111111' },
                    { icon: <PlayCircle size={20} color="#ffffff" />, label: 'Videos', desc: 'Watch lesson tutorials', to: '/videos', color: '#111111' },
                    { icon: <TrendingUp size={20} color="#ffffff" />, label: 'Progress', desc: 'Track your achievements', to: '/progress', color: '#111111' },
                ].map(a => (
                    <Link key={a.to} to={a.to} className="card card-padded flex items-center gap-4 page-style-64" >
                        <div style={{ width: 48, height: 48, background: a.color, border: '1px solid #333333', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {a.icon}
                        </div>
                        <div>
                            <div className="page-style-65">{a.label}</div>
                            <div className="page-style-66">{a.desc}</div>
                        </div>
                        <ArrowRight size={16} className="page-style-67" />
                    </Link>
                ))}
            </div>

            {/* Saved Songs */}
            {data?.savedSongs?.length > 0 && (
                <div className="mb-8">
                    <div className="section-header page-style-68" >
                        <div>
                            <h2 className="section-title page-style-69" >Saved Songs</h2>
                            <p className="section-subtitle page-style-70" >Songs you're working on</p>
                        </div>
                        <Link to="/discover" className="btn btn-secondary btn-sm page-style-71" >VIEW ALL</Link>
                    </div>
                    <div className="grid-auto-fill-260 page-style-72" >
                        {data.savedSongs.slice(0, 4).map((s, i) => (
                            <div key={i} className="card card-padded page-style-73" >
                                <div className="page-style-74">🎸</div>
                                <div className="page-style-75">{s.song_title}</div>
                                <div className="page-style-76">{s.song_artist}</div>
                                {s.difficulty && <div className="badge badge-primary mt-2 page-style-77" >{s.difficulty.toUpperCase()}</div>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Achievements */}
            {data?.achievements?.length > 0 && (
                <div>
                    <div className="section-header page-style-78" >
                        <div>
                            <h2 className="section-title page-style-79" >Recent Achievements</h2>
                            <p className="section-subtitle page-style-80" >Milestones you've unlocked</p>
                        </div>
                        <Link to="/progress" className="btn btn-secondary btn-sm page-style-81" >VIEW ALL</Link>
                    </div>
                    <div className="grid-auto-fill-260 page-style-82" >
                        {data.achievements.slice(0, 4).map((a, i) => (
                            <div key={i} className="card card-padded page-style-83" >
                                <div className="page-style-84">{a.icon}</div>
                                <div className="page-style-85">{a.title}</div>
                                <div className="page-style-86">{a.description}</div>
                                <div className="badge badge-accent mt-2 page-style-87" >+{a.xp_reward} XP</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

