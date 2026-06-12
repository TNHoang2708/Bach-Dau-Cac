import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useFood } from '../context/FoodContext'
import { useApp } from '../context/AppContext'
import { db } from '../firebase'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { TrendingUp, Flame, Target, Award, Calendar } from 'lucide-react'

// Lấy 7 ngày gần nhất
function getLast7Days() {
    const days = []
    for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        days.push(d)
    }
    return days
}

function formatDay(date) {
    return date.toLocaleDateString('vi-VN', { weekday: 'short' }).replace('Thứ ', 'T')
}

function isSameDay(d1, d2) {
    return d1.toDateString() === d2.toDateString()
}

function Dashboard() {
    const { user } = useAuth()
    const { foodLog, dailyGoal } = useFood()
    const { mucTieu, canNang } = useApp()
    const [workoutLogs, setWorkoutLogs] = useState([])
    const [loading, setLoading] = useState(true)

    const days = getLast7Days()

    // Load nhật ký tập từ Firestore (realtime)
    useEffect(() => {
        if (!user) return
        const q = query(collection(db, 'users', user.uid, 'nhatky'), orderBy('ngay', 'desc'))
        const unsub = onSnapshot(q, (snap) => {
            setWorkoutLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })))
            setLoading(false)
        }, (e) => {
            console.error(e)
            setLoading(false)
        })
        return () => unsub()
    }, [user])

    // Tính macro theo từng ngày trong 7 ngày
    const weeklyData = days.map(day => {
        const dayMeals = foodLog.filter(m => {
            const mDate = m._jsDate
            return mDate instanceof Date && isSameDay(mDate, day)
        })
        return {
            label: formatDay(day),
            date: day,
            calories: dayMeals.reduce((s, m) => s + (m.calories || 0), 0),
            protein: dayMeals.reduce((s, m) => s + (m.protein || 0), 0),
            carbs: dayMeals.reduce((s, m) => s + (m.carbs || 0), 0),
            fat: dayMeals.reduce((s, m) => s + (m.fat || 0), 0),
            meals: dayMeals.length,
        }
    })

    // Streak tập luyện
    const workoutStreak = (() => {
        let streak = 0
        for (let i = 0; i < 30; i++) {
            const d = new Date()
            d.setDate(d.getDate() - i)
            const hasWorkout = workoutLogs.some(w => {
                const wDate = w.ngay?.toDate?.() ?? new Date(w.ngay ?? 0)
                return isSameDay(wDate, d)
            })
            if (hasWorkout) streak++
            else if (i > 0) break
        }
        return streak
    })()

    // Ngày tập trong tuần
    const workoutDays = days.map(day => ({
        label: formatDay(day),
        hasWorkout: workoutLogs.some(w => {
            const wDate = w.ngay?.toDate?.() ?? new Date(w.ngay ?? 0)
            return isSameDay(wDate, day)
        })
    }))

    // Tổng tuần
    const weekTotal = {
        calories: weeklyData.reduce((s, d) => s + d.calories, 0),
        protein: weeklyData.reduce((s, d) => s + d.protein, 0),
        meals: weeklyData.reduce((s, d) => s + d.meals, 0),
    }

    const maxCalories = Math.max(...weeklyData.map(d => d.calories), dailyGoal.calories)

    const macroColors = {
        protein: 'var(--accent)',
        carbs: '#60a5fa',
        fat: '#f97316',
    }

    // Hôm nay
    const today = weeklyData[6]
    const caloriePercent = Math.min(100, Math.round((today.calories / dailyGoal.calories) * 100))

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ color: 'var(--text)', fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>
                    Dashboard
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                    Tổng quan 7 ngày gần nhất
                </p>
            </div>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '1.5rem' }}>
                {[
                    {
                        icon: <Flame size={16} />,
                        label: 'Streak tập',
                        value: `${workoutStreak} ngày`,
                        color: '#f97316',
                        sub: workoutStreak >= 3 ? '🔥 Đang hot!' : 'Cố lên nào!'
                    },
                    {
                        icon: <Target size={16} />,
                        label: 'Calo hôm nay',
                        value: `${today.calories}`,
                        color: 'var(--accent)',
                        sub: `/ ${dailyGoal.calories} kcal (${caloriePercent}%)`
                    },
                    {
                        icon: <TrendingUp size={16} />,
                        label: 'Calo tuần',
                        value: weekTotal.calories.toLocaleString(),
                        color: '#60a5fa',
                        sub: `TB ${Math.round(weekTotal.calories / 7)}/ngày`
                    },
                    {
                        icon: <Award size={16} />,
                        label: 'Bữa ăn ghi nhận',
                        value: `${weekTotal.meals}`,
                        color: '#a78bfa',
                        sub: 'trong 7 ngày'
                    },
                ].map(({ icon, label, value, color, sub }) => (
                    <div key={label} className="card" style={{ padding: '1.25rem', marginBottom: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color, marginBottom: '8px', fontSize: '12px' }}>
                            {icon} {label}
                        </div>
                        <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>
                            {value}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{sub}</div>
                    </div>
                ))}
            </div>

            {/* Biểu đồ calo tuần */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TrendingUp size={14} style={{ color: 'var(--accent)' }} /> Calo 7 ngày
                </div>

                {/* Bar chart */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '140px', marginBottom: '8px' }}>
                    {weeklyData.map((day, i) => {
                        const isToday = i === 6
                        const height = day.calories === 0 ? 4 : Math.max(8, (day.calories / maxCalories) * 120)
                        const overGoal = day.calories > dailyGoal.calories
                        return (
                            <div key={day.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
                                <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                                    {day.calories > 0 ? day.calories : ''}
                                </div>
                                <div
                                    title={`${day.calories} kcal`}
                                    style={{
                                        width: '100%',
                                        height: `${height}px`,
                                        background: overGoal
                                            ? 'linear-gradient(to top, #f97316, #fb923c)'
                                            : isToday
                                                ? 'linear-gradient(to top, var(--accent), #00ffbf)'
                                                : 'var(--card2)',
                                        borderRadius: '6px 6px 0 0',
                                        border: isToday ? '1px solid var(--accent)' : '1px solid var(--border)',
                                        transition: 'height 0.4s ease',
                                        position: 'relative',
                                    }}
                                />
                            </div>
                        )
                    })}
                </div>

                {/* Goal line label */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    {weeklyData.map((day, i) => (
                        <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: '11px', color: i === 6 ? 'var(--accent)' : 'var(--text-secondary)', fontWeight: i === 6 ? 700 : 400 }}>
                            {day.label}
                        </div>
                    ))}
                </div>

                {/* Legend */}
                <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--accent)', display: 'inline-block' }} /> Hôm nay
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#f97316', display: 'inline-block' }} /> Vượt mục tiêu
                    </span>
                    <span style={{ marginLeft: 'auto' }}>Mục tiêu: {dailyGoal.calories} kcal/ngày</span>
                </div>
            </div>

            {/* Macro breakdown tuần */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div className="card-title">Macro trung bình / ngày (7 ngày)</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    {[
                        { key: 'protein', label: 'Protein', unit: 'g', goal: dailyGoal.protein, color: macroColors.protein },
                        { key: 'carbs', label: 'Carb', unit: 'g', goal: dailyGoal.carbs, color: macroColors.carbs },
                        { key: 'fat', label: 'Fat', unit: 'g', goal: dailyGoal.fat, color: macroColors.fat },
                    ].map(({ key, label, unit, goal, color }) => {
                        const avg = Math.round(weeklyData.reduce((s, d) => s + d[key], 0) / 7)
                        const pct = Math.min(100, Math.round((avg / goal) * 100))
                        return (
                            <div key={key} style={{ textAlign: 'center' }}>
                                {/* Circular progress */}
                                <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 8px' }}>
                                    <svg viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
                                        <circle cx="40" cy="40" r="32" fill="none" stroke="var(--border)" strokeWidth="8" />
                                        <circle
                                            cx="40" cy="40" r="32" fill="none"
                                            stroke={color} strokeWidth="8"
                                            strokeDasharray={`${2 * Math.PI * 32}`}
                                            strokeDashoffset={`${2 * Math.PI * 32 * (1 - pct / 100)}`}
                                            strokeLinecap="round"
                                            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                                        />
                                    </svg>
                                    <div style={{
                                        position: 'absolute', inset: 0, display: 'flex',
                                        flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>{avg}</span>
                                        <span style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>{unit}</span>
                                    </div>
                                </div>
                                <div style={{ fontSize: '12px', fontWeight: 600, color }}>
                                    {label}
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                    {pct}% mục tiêu ({goal}{unit})
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Lịch tập tuần */}
            <div className="card">
                <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={14} style={{ color: 'var(--accent)' }} /> Lịch tập tuần này
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {workoutDays.map((d, i) => (
                        <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                            <div style={{
                                width: '100%',
                                aspectRatio: '1',
                                borderRadius: '10px',
                                background: d.hasWorkout ? 'var(--accent)' : 'var(--card2)',
                                border: `1px solid ${d.hasWorkout ? 'var(--accent)' : 'var(--border)'}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '16px',
                                marginBottom: '6px',
                            }}>
                                {d.hasWorkout ? '💪' : ''}
                            </div>
                            <div style={{ fontSize: '11px', color: i === 6 ? 'var(--accent)' : 'var(--text-secondary)', fontWeight: i === 6 ? 700 : 400 }}>
                                {d.label}
                            </div>
                        </div>
                    ))}
                </div>
                {!loading && workoutLogs.length === 0 && (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', textAlign: 'center', marginTop: '12px' }}>
                        Chưa có buổi tập nào được ghi nhận. Vào Nhật ký để thêm!
                    </p>
                )}
            </div>
        </div>
    )
}

export default Dashboard
