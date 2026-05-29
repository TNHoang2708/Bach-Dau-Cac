import { useApp } from '../context/AppContext'

function GoalPicker() {
    const { mucTieu, setMucTieu } = useApp()

    const goals = [
        { value: 'Tăng cơ', icon: '💪', desc: 'Xây dựng khối cơ' },
        { value: 'Giảm mỡ', icon: '🔥', desc: 'Đốt cháy mỡ thừa' },
        { value: 'Tăng cơ/Giảm mỡ', icon: '⚡', desc: 'Tổng hợp' },
        { value: 'Tăng sức bền', icon: '🏃', desc: 'Cardio & endurance' },
    ]

    return (
        <div className="card">
            <div className="card-title">Mục tiêu tập luyện</div>
            <div className="goal-grid">
                {goals.map((g) => (
                    <div key={g.value} className={`goal-card ${mucTieu === g.value ? 'active' : ''}`} onClick={() => setMucTieu(g.value)}>
                        <span className="goal-icon">{g.icon}</span>
                        <strong>{g.value}</strong>
                        <span className="goal-desc">{g.desc}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default GoalPicker