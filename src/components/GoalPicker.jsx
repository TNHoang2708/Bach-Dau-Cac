import { useApp } from '../context/AppContext'
import { Dumbbell, Flame, Zap, Timer } from 'lucide-react'

function GoalPicker() {
    const { mucTieu, setMucTieu } = useApp()

    const goals = [
        { value: 'Tăng cơ', icon: <Dumbbell size={32} />, desc: 'Xây dựng khối cơ' },
        { value: 'Giảm mỡ', icon: <Flame size={32} />, desc: 'Đốt cháy mỡ thừa' },
        { value: 'Tăng cơ/Giảm mỡ', icon: <Zap size={32} />, desc: 'Tổng hợp' },
        { value: 'Tăng sức bền', icon: <Timer size={32} />, desc: 'Cardio & endurance' },
    ]

    return (
        <div className="card">
            <div className="card-title">Mục tiêu tập luyện</div>
            <div className="goal-grid">
                {goals.map((g) => (
                    <div
                        key={g.value}
                        className={`goal-card ${mucTieu === g.value ? 'active' : ''}`}
                        onClick={() => setMucTieu(g.value)}
                    >
                        <span className="goal-icon" style={{ color: mucTieu === g.value ? 'var(--accent)' : 'var(--text-secondary)' }}>
                            {g.icon}
                        </span>
                        <strong>{g.value}</strong>
                        <span className="goal-desc">{g.desc}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default GoalPicker