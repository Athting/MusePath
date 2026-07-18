
import { useEffect, useState } from 'react'
import { useStore } from '../store/useStore'
import { useAuth } from '../hooks/useAuth'
import { api } from '../services/api'
import { Music, Target, Sparkles, Play, Pause } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import WeekCard from '../components/plan/WeekCard'

export default function LearningPlanPage() {
    const { addToast } = useStore()
    const { user } = useAuth()
    const [plan, setPlan] = useState(null)
    const [plans, setPlans] = useState([])
    const [switching, setSwitching] = useState(false)
    const [weeks, setWeeks] = useState([])
    const [activeMonth, setActiveMonth] = useState(0)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
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

    const load = async () => {
        try {
            const data = await api.getDashboard(user.id)
            setPlan(data.plan)
            // Parse weeks from plan_data
            let planData = data.plan?.plan_data
            if (typeof planData === 'string') {
                try {
                    planData = JSON.parse(planData)
                } catch (e) {
                    console.error('Error parsing plan_data in load:', e)
                }
            }
            const dbWeeks = data.weeks || []
            const dbWeeksMap = {}
            dbWeeks.forEach(w => {
                dbWeeksMap[`${w.month_number}_${w.week_number}`] = w
            })

            if (planData?.months) {
                // Merge DB week properties (id, is_completed, practice_minutes, etc.) into planData months structure
                const enrichedMonths = planData.months.map(m => ({
                    ...m,
                    weeks: (m.weeks || []).map(w => {
                        const dbWeek = dbWeeksMap[`${m.monthNumber}_${w.weekNumber}`] || {}
                        return {
                            ...w,
                            // Dashboard weeks are lean MongoDB documents, which expose `_id`
                            // rather than the `id` virtual used by the client.
                            id: dbWeek.id || (dbWeek._id ? String(dbWeek._id) : undefined),
                            is_completed: dbWeek.is_completed || false,
                            practice_minutes: dbWeek.practice_minutes || w.practiceMinutes || 20,
                            week_number: w.weekNumber,
                            practice_goal: w.practiceGoal,
                            youtubeSearches: w.youtubeSearches || w.youtube_searches || []
                        }
                    })
                }))
                setWeeks(enrichedMonths)
            }

            // Fetch all plans for switcher
            const plansData = await api.getPlans(user.id)
            setPlans(plansData || [])
        } catch (err) {
            addToast('Failed to load plan', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleSwitchPlan = async (planId) => {
        if (!planId || planId === (plan?.id || plan?._id)) return
        setSwitching(true)
        try {
            await api.setActivePlan({ userId: user.id, planId })
            addToast('Active plan switched successfully! 🎸', 'success')
            await load()
        } catch (err) {
            addToast('Failed to switch active plan: ' + err.message, 'error')
        } finally {
            setSwitching(false)
        }
    }

    useEffect(() => { if (user) load() }, [user])

    if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>

    if (!plan) return (
        <div className="page-content">
            {plans.length > 0 ? (
                <div className="card card-padded text-center page-style-150" >
                    <div className="page-style-151">🗺️</div>
                    <h2 className="onboarding-title page-style-152" >No Active Plan</h2>
                    <p className="onboarding-subtitle page-style-153" >Select one of your existing plans below or generate a new one.</p>
                    <div className="flex justify-center items-center gap-4 mb-6 page-style-154" >
                        <span className="page-style-155">
                            Select Plan:
                        </span>
                        <select
                            value=""
                            onChange={(e) => handleSwitchPlan(e.target.value)}
                            disabled={switching}
                            className="plan-select"
                        >
                            <option value="" disabled className="page-style-156">-- Select a Plan --</option>
                            {plans.map(p => (
                                <option key={p.id || p._id} value={p.id || p._id} className="page-style-157">
                                    {p.instrument.toUpperCase()} ({p.skill_level.toUpperCase()}) — {p.title || 'Untitled Plan'}
                                </option>
                            ))}
                        </select>
                        {switching && <span className="page-style-158">Switching...</span>}
                    </div>
                    <button onClick={() => navigate('/onboarding')} className="btn btn-primary page-style-159" >
                        <Sparkles size={16} />
                        Create New Plan
                    </button>
                </div>
            ) : (
                <div className="empty-state">
                    <div className="empty-state-icon">🗺️</div>
                    <div className="empty-state-title">No Plan Yet</div>
                    <div className="empty-state-desc">Generate your personalized learning plan to get started.</div>
                    <button onClick={() => navigate('/onboarding')} className="btn btn-primary mt-4">
                        <Sparkles size={16} />
                        Generate My Plan
                    </button>
                </div>
            )}
        </div>
    )

    let planData = plan?.plan_data
    if (typeof planData === 'string') {
        try {
            planData = JSON.parse(planData)
        } catch (e) {
            console.error('Error parsing planData in render:', e)
        }
    }
    const months = weeks || []
    const currentMonth = months[activeMonth]

    return (
        <div className="page-content animate-fade-in">
            <div className="page-header">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="page-title">{planData?.title || 'My Learning Plan'}</h1>
                        <p className="page-description">{planData?.summary}</p>
                    </div>
                    <div className="flex gap-3">
                        <span className="badge badge-primary">{plan.instrument}</span>
                        <span className="badge badge-accent">{plan.skill_level}</span>
                        <span className="badge badge-muted">{plan.goal_duration}</span>
                    </div>
                </div>
            </div>

            {/* Plans Manager Bar */}
            <div className="page-style-160">
                <div className="flex items-center gap-3 page-style-161" >
                    <span className="page-style-162">
                        Active Plan:
                    </span>
                    <select
                        value={plan?.id || plan?._id || ''}
                        onChange={(e) => handleSwitchPlan(e.target.value)}
                        disabled={switching}
                        className="plan-select"
                    >
                        {plans.map(p => (
                            <option key={p.id || p._id} value={p.id || p._id} className="page-style-163">
                                {p.instrument.toUpperCase()} ({p.skill_level.toUpperCase()}) — {p.title || 'Untitled Plan'}
                            </option>
                        ))}
                    </select>
                    {switching && <span className="page-style-164">Switching...</span>}
                </div>
                <button
                    onClick={() => navigate('/onboarding')}
                    className="btn btn-secondary btn-sm page-style-165"

                >
                    <Sparkles size={12} className="page-style-166" />
                    Create New Plan
                </button>
            </div>

            {/* Month selector */}
            <div className="page-style-167">
                {months.map((m, i) => (
                    <button
                        key={i}
                        onClick={() => setActiveMonth(i)}
                        className={`btn btn-sm ${activeMonth === i ? 'btn-primary' : 'btn-secondary'}`}
                    >
                        Month {m.monthNumber}: {m.theme}
                    </button>
                ))}
            </div>

            {/* Month overview */}
            {currentMonth && (
                <>
                    <div className="card card-padded mb-6 page-style-168" >
                        <div className="page-style-169">
                            Month {currentMonth.monthNumber}
                        </div>
                        <div className="page-style-170">
                            {currentMonth.theme}
                        </div>
                        <p className="page-style-171">
                            {currentMonth.overview}
                        </p>
                        <div className="page-style-172">
                            <Target size={16} color="var(--success)" />
                            <span className="page-style-173"><strong>Goal:</strong> {currentMonth.monthlyMilestone}</span>
                        </div>
                    </div>

                    {/* Weeks */}
                    <div className="page-style-174">
                        {currentMonth.weeks?.map((week, wi) => (
                            <WeekCard
                                key={wi}
                                week={week}
                                monthIdx={activeMonth}
                                planId={plan.id}
                                userId={user.id}
                                onComplete={load}
                            />
                        ))}
                    </div>
                </>
            )}

            {/* Tips */}
            {planData?.tips?.length > 0 && (
                <div className="card card-padded mt-8">
                    <h3 className="page-style-175">💡 Pro Tips</h3>
                    <div className="page-style-176">
                        {planData.tips.map((tip, i) => (
                            <div key={i} className="page-style-177">
                                <span className="page-style-178">{i + 1}.</span>
                                <span className="page-style-179">{tip}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}



