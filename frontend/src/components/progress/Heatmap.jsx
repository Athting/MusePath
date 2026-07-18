function localDateKey(value) {
    const date = value instanceof Date ? value : new Date(value)
    if (Number.isNaN(date.getTime())) return null
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export default function Heatmap({ logs }) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const firstDay = new Date(today)
    firstDay.setDate(today.getDate() - 363)

    const minutesByDate = logs.reduce((result, log) => {
        const key = localDateKey(log.practiced_at)
        if (key) result[key] = (result[key] || 0) + Number(log.duration_minutes || 0)
        return result
    }, {})

    const cells = Array.from({ length: 364 }, (_, index) => {
        const date = new Date(firstDay)
        date.setDate(firstDay.getDate() + index)
        const key = localDateKey(date)
        const minutes = minutesByDate[key] || 0
        const level = minutes <= 0 ? 0 : minutes <= 20 ? 1 : minutes <= 45 ? 2 : minutes <= 90 ? 3 : 4
        return { key, minutes, level }
    })

    return <div>
        <div className="heatmap">
            {cells.map(cell => <div key={cell.key} className="heatmap-cell" data-level={cell.level} title={cell.key + (cell.minutes > 0 ? ` · ${cell.minutes} min` : '')} />)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            <span>Less</span>
            {[0, 1, 2, 3, 4].map(level => <div key={level} className="heatmap-cell" data-level={level} style={{ width: 12, height: 12, borderRadius: 2, flexShrink: 0 }} />)}
            <span>More</span>
        </div>
    </div>
}
