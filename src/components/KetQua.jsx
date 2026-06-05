import { useApp } from '../context/AppContext'

function KetQua() {
    const { ketQua, loading } = useApp()

    if (loading) {
        return (
            <div className="loading-box">
                <div className="spinner"></div>
                <p>Đang tạo lịch tập cho bạn...</p>
            </div>
        )
    }

    if (!ketQua?.schedule) return null

    return (
        <div className="ketqua">

            {ketQua.schedule.map((day, index) => (
                <div
                    key={index}
                    style={{
                        marginBottom: '24px',
                        padding: '20px',
                        background: 'var(--card2)',
                        borderRadius: '12px',
                        border: '1px solid var(--border)'
                    }}
                >
                    <h3>
                        {day.day} - {day.group}
                    </h3>

                    <div
                        style={{
                            display: 'grid',
                            gap: '10px',
                            marginTop: '16px'
                        }}
                    >
                        {day.exercises.map((exercise, i) => (
                            <div
                                key={i}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    padding: '10px',
                                    background: '#151515',
                                    borderRadius: '8px'
                                }}
                            >
                                <span>
                                    {exercise.name}
                                </span>

                                <strong>
                                    {exercise.sets} x {exercise.reps}
                                </strong>
                            </div>
                        ))}
                    </div>

                </div>
            ))}

        </div>
    )
}

export default KetQua