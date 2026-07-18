import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { api } from '../../services/api'

export default function LogPracticeModal({ userId, planId, onClose, onSuccess }) {
    const [mins, setMins] = useState(30)
    const [notes, setNotes] = useState('')
    const [mood, setMood] = useState('Chill')
    const [loading, setLoading] = useState(false)
    const { addToast } = useStore()

    const submit = async () => {
        setLoading(true)
        try {
            await api.logProgress({ userId, planId, durationMinutes: mins, notes, mood })
            addToast(`${mins} minutes logged! Keep going 🔥`, 'success')
            await onSuccess()
            onClose()
        } catch {
            addToast('Failed to log practice', 'error')
        } finally {
            setLoading(false)
        }
    }

    return <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)' }}>
        <div className="card card-padded animate-scale-in" style={{ width: '100%', maxWidth: 440, position: 'relative' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-2xl)', color: 'var(--text-primary)', marginBottom: 'var(--space-6)' }}>Log Practice Session 🎸</h2>
            <div className="input-group mb-4">
                <label className="input-label">Duration (minutes)</label>
                <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>{[15, 20, 30, 45, 60, 90].map(value => <button key={value} onClick={() => setMins(value)} className={`btn btn-sm ${mins === value ? 'btn-primary' : 'btn-secondary'}`}>{value} min</button>)}</div>
                <input type="number" className="input mt-2" value={mins} min={1} max={300} onChange={event => setMins(parseInt(event.target.value) || 0)} />
            </div>
            <div className="input-group mb-4">
                <label className="input-label">Mood</label>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>{['Chill', 'Fun', 'Intense', 'Focused'].map(value => <button key={value} onClick={() => setMood(value)} className={`multi-tag ${mood === value ? 'selected' : ''}`}>{value}</button>)}</div>
            </div>
            <div className="input-group mb-6">
                <label className="input-label">Notes (optional)</label>
                <textarea className="input" rows={3} placeholder="What did you practice?" value={notes} onChange={event => setNotes(event.target.value)} style={{ resize: 'none' }} />
            </div>
            <div className="flex gap-3">
                <button onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
                <button onClick={submit} disabled={loading || mins <= 0} className="btn btn-primary flex-1">{loading ? 'Logging...' : 'Log Session ✓'}</button>
            </div>
        </div>
    </div>
}
