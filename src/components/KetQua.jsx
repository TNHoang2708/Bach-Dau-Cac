import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { ChevronDown, Dumbbell, Zap } from 'lucide-react'

function KetQua() {
    const { ketQua, loading } = useApp()
    const [openDays, setOpenDays] = useState({})

    const toggleDay = (index) => {
        setOpenDays(prev => ({ ...prev, [index]: !prev[index] }))
    }

    if (loading) {
        return (
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: '20px', minHeight: '400px',
                background: 'var(--card)', borderRadius: '20px',
                border: '1px solid var(--border)',
            }}>
                <div className="spinner" />
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    Đang tạo lịch tập cho bạn...
                </p>
            </div>
        )
    }

    if (!ketQua?.schedule) {
        return (
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: '16px', minHeight: '400px',
                background: 'var(--card)', borderRadius: '20px',
                border: '1px solid var(--border)',
                padding: '2rem', textAlign: 'center',
            }}>
                <div style={{
                    width: '64px', height: '64px', borderRadius: '16px',
                    background: 'var(--accent-dim)', border: '1px solid rgba(59,130,246,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Dumbbell size={28} color='var(--accent)' strokeWidth={1.5} />
                </div>
                <div>
                    <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
                        Chưa có lịch tập
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        Nhập thông tin và nhấn <strong style={{ color: 'var(--accent)' }}>Tạo lịch tập</strong> để bắt đầu
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Header */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: '4px'
            }}>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Zap size={13} color='var(--accent)' />
                    <span>{ketQua.schedule.length} buổi tập / tuần</span>
                </div>
                <button
                    onClick={() => {
                        const allOpen = ketQua.schedule.every((_, i) => openDays[i])
                        const newState = {}
                        if (!allOpen) ketQua.schedule.forEach((_, i) => newState[i] = true)
                        setOpenDays(newState)
                    }}
                    style={{
                        width: 'auto', padding: '5px 12px', fontSize: '12px',
                        background: 'transparent', border: '1px solid var(--border)',
                        color: 'var(--text-secondary)', borderRadius: '8px',
                    }}
                >
                    {ketQua.schedule.every((_, i) => openDays[i]) ? 'Thu gọn tất cả' : 'Mở tất cả'}
                </button>
            </div>

            {ketQua.schedule.map((day, index) => {
                const isOpen = openDays[index]
                return (
                    <div
                        key={index}
                        style={{
                            background: 'var(--card)',
                            borderRadius: '16px',
                            border: '1px solid var(--border)',
                            overflow: 'hidden',
                            transition: 'border-color 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-hover)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                    >
                        {/* Day header - clickable */}
                        <div
                            onClick={() => toggleDay(index)}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '14px 18px', cursor: 'pointer',
                                background: isOpen ? 'var(--card2)' : 'transparent',
                                transition: 'background 0.2s',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '8px',
                                    background: 'var(--accent-dim)', border: '1px solid rgba(59,130,246,0.2)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '11px', fontWeight: 700, color: 'var(--accent)',
                                }}>
                                    {index + 1}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text)' }}>
                                        {day.day}
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 500, marginTop: '1px' }}>
                                        {day.group}
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                    {day.exercises.length} bài
                                </span>
                                <ChevronDown
                                    size={16}
                                    color='var(--text-secondary)'
                                    style={{
                                        transform: isOpen ? 'rotate(180deg)' : 'none',
                                        transition: 'transform 0.2s'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Exercises - collapsible */}
                        {isOpen && (
                            <div style={{ borderTop: '1px solid var(--border)' }}>
                                {day.exercises.map((exercise, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            display: 'flex', justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '11px 18px',
                                            borderBottom: i < day.exercises.length - 1
                                                ? '1px solid rgba(255,255,255,0.03)'
                                                : 'none',
                                            transition: 'background 0.15s',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <span style={{ fontSize: '13px', color: 'var(--text)' }}>
                                            {exercise.name}
                                        </span>
                                        <span style={{
                                            fontSize: '13px', fontWeight: 600,
                                            color: 'var(--accent)', fontVariantNumeric: 'tabular-nums'
                                        }}>
                                            {exercise.sets} × {exercise.reps}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}

export default KetQua
