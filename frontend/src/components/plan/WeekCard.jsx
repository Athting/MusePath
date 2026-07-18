import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { api } from '../../services/api'
import { ArrowRight, CheckCircle, ChevronDown, ChevronUp, Target, Youtube } from 'lucide-react'

export default function WeekCard({ week, planId, userId, onComplete }) {
    const [open, setOpen] = useState(false)
    const [logging, setLogging] = useState(false)
    const { addToast } = useStore()

    const markComplete = async () => {
        setLogging(true)
        try {
            await api.logProgress({
                userId, planId,
                weekId: week.id,
                durationMinutes: week.practice_minutes || 30,
                notes: `Completed: ${week.title}`
            })
            addToast('Week marked complete! +XP earned 🎯', 'success')
            onComplete()
        } catch {
            addToast('Failed to log progress', 'error')
        } finally {
            setLogging(false)
        }
    }

    return (
        <div className={`week-card ${week.is_completed ? 'completed' : ''}`}>
            <div className="week-card-header" onClick={() => setOpen(value => !value)}>
                <div style={{ flex: 1 }}>
                    <div className="flex items-center gap-2">
                        <div className="week-number">Week {week.week_number}</div>
                        {week.is_completed && <span className="badge badge-success">✓ Done</span>}
                    </div>
                    <div className="week-title">{week.title}</div>
                    {week.practice_goal && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 4 }}>🕐 {week.practice_goal}</div>}
                </div>
                <div className="flex items-center gap-3">
                    {!week.is_completed && (
                        <button onClick={event => { event.stopPropagation(); markComplete() }} disabled={logging} className="btn btn-secondary btn-sm">
                            <CheckCircle size={14} />
                            {logging ? 'Saving...' : 'Mark Done'}
                        </button>
                    )}
                    {open ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                </div>
            </div>

            {open && (
                <div className="week-body animate-fade-up" style={{ paddingTop: 'var(--space-5)' }}>
                    {week.topics?.length > 0 && <DetailChips label="Topics" items={week.topics} className="badge-primary" />}
                    {week.skills?.length > 0 && <DetailChips label="Skills" items={week.skills} className="badge-accent" />}

                    {week.songs?.length > 0 && (
                        <div className="mb-4">
                            <SectionLabel>🎵 Songs to Learn</SectionLabel>
                            {week.songs.map((song, index) => (
                                <div key={index} style={{ padding: 'var(--space-3)', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-2)', border: '1px solid var(--border)' }}>
                                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 'var(--text-sm)' }}>{song.title}</div>
                                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>by {song.artist}</div>
                                    {song.whyRecommended && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.5 }}>{song.whyRecommended}</div>}
                                    {song.skillsLearned?.length > 0 && <div className="chip-row mt-2">{song.skillsLearned.map(skill => <span key={skill} className="badge badge-muted">{skill}</span>)}</div>}
                                </div>
                            ))}
                        </div>
                    )}

                    {week.youtubeSearches?.length > 0 && (
                        <div className="mb-4">
                            <SectionLabel>🎬 Suggested Searches</SectionLabel>
                            {week.youtubeSearches.map((query, index) => (
                                <a key={index} href={`https://youtube.com/results?search_query=${encodeURIComponent(query)}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-2) var(--space-3)', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-2)', border: '1px solid var(--border)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'border-color 0.2s' }}>
                                    <Youtube size={14} color="#ff4444" />
                                    {query}
                                    <ArrowRight size={12} style={{ marginLeft: 'auto', opacity: 0.5 }} />
                                </a>
                            ))}
                        </div>
                    )}

                    {week.milestone && <div style={{ padding: 'var(--space-4)', background: 'var(--success-glow)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--radius-lg)', display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                        <Target size={16} color="var(--success)" style={{ flexShrink: 0, marginTop: 2 }} />
                        <div>
                            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Milestone</div>
                            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>{week.milestone}</div>
                        </div>
                    </div>}
                </div>
            )}
        </div>
    )
}

function SectionLabel({ children }) {
    return <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 'var(--space-3)' }}>{children}</div>
}

function DetailChips({ label, items, className }) {
    return <div className="mb-4">
        <SectionLabel>{label}</SectionLabel>
        <div className="chip-row">{items.map(item => <span key={item} className={`badge ${className}`}>{item}</span>)}</div>
    </div>
}
