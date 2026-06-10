import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { db } from '../firebase'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'

const STEPS = [
    {
        id: 'gender',
        question: 'Bạn là',
        type: 'card',
        options: [
            { value: 'male', label: 'Nam', emoji: '♂️' },
            { value: 'female', label: 'Nữ', emoji: '♀️' },
            { value: 'other', label: 'Khác', emoji: '⚧️' },
        ]
    },
    {
        id: 'ageGroup',
        question: 'Độ tuổi của bạn',
        type: 'card',
        options: [
            { value: '18-29', label: '18 – 29', emoji: '🔥' },
            { value: '30-39', label: '30 – 39', emoji: '💪' },
            { value: '40-49', label: '40 – 49', emoji: '⚡' },
            { value: '50+', label: '50+', emoji: '🏆' },
        ]
    },
    {
        id: 'height',
        question: 'Chiều cao của bạn',
        type: 'number',
        unit: 'cm',
        placeholder: '175',
        min: 130, max: 230,
    },
    {
        id: 'weight',
        question: 'Cân nặng hiện tại',
        type: 'number',
        unit: 'kg',
        placeholder: '70',
        min: 30, max: 200,
    },
    {
        id: 'bodyType',
        question: 'Vóc dáng hiện tại của bạn',
        type: 'card',
        options: [
            { value: 'slim', label: 'Gầy', emoji: '🪄', desc: 'Khó tăng cân' },
            { value: 'average', label: 'Trung bình', emoji: '✅', desc: 'Cân đối' },
            { value: 'overweight', label: 'Thừa cân', emoji: '🎯', desc: 'Cần giảm mỡ' },
            { value: 'muscular', label: 'Cơ bắp', emoji: '💪', desc: 'Đã có nền tảng' },
        ]
    },
    {
        id: 'experience',
        question: 'Kinh nghiệm tập luyện',
        type: 'card',
        options: [
            { value: 'beginner', label: 'Mới bắt đầu', emoji: '🌱', desc: 'Chưa từng tập' },
            { value: 'novice', label: 'Dưới 1 năm', emoji: '📈', desc: 'Đang học' },
            { value: 'intermediate', label: '1 – 3 năm', emoji: '🏋️', desc: 'Có kinh nghiệm' },
            { value: 'advanced', label: '3 năm+', emoji: '🔱', desc: 'Lão làng' },
        ]
    },
    {
        id: 'location',
        question: 'Bạn thường tập ở đâu',
        type: 'card',
        options: [
            { value: 'gym', label: 'Phòng gym', emoji: '🏢' },
            { value: 'home', label: 'Tại nhà', emoji: '🏠' },
            { value: 'both', label: 'Cả hai', emoji: '🔄' },
        ]
    },
    {
        id: 'currentFrequency',
        question: 'Hiện tại bạn tập mấy buổi/tuần',
        type: 'card',
        options: [
            { value: '0', label: 'Chưa tập', emoji: '😴' },
            { value: '1-2', label: '1 – 2 buổi', emoji: '🚶' },
            { value: '3-4', label: '3 – 4 buổi', emoji: '🏃' },
            { value: '5+', label: '5+ buổi', emoji: '🔥' },
        ]
    },
    {
        id: 'injuries',
        question: 'Bạn có chấn thương hay bệnh lý không',
        type: 'multicard',
        options: [
            { value: 'none', label: 'Không có', emoji: '✅' },
            { value: 'back', label: 'Đau lưng', emoji: '🔸' },
            { value: 'knee', label: 'Đau gối', emoji: '🔸' },
            { value: 'shoulder', label: 'Đau vai', emoji: '🔸' },
            { value: 'blood_pressure', label: 'Huyết áp cao', emoji: '❤️' },
            { value: 'other', label: 'Khác', emoji: '⚠️' },
        ]
    },
    {
        id: 'mainGoal',
        question: 'Mục tiêu chính của bạn',
        type: 'card',
        options: [
            { value: 'muscle_gain', label: 'Tăng cơ', emoji: '💪', desc: 'Xây dựng khối cơ' },
            { value: 'fat_loss', label: 'Giảm mỡ', emoji: '🔥', desc: 'Đốt cháy mỡ thừa' },
            { value: 'strength', label: 'Tăng sức mạnh', emoji: '⚡', desc: 'Nâng tạ nặng hơn' },
            { value: 'general', label: 'Sức khỏe tổng quát', emoji: '🌿', desc: 'Khỏe mạnh, dẻo dai' },
        ]
    },
    {
        id: 'targetBody',
        question: 'Cơ thể bạn hướng tới',
        type: 'card',
        options: [
            { value: 'lean', label: 'Lean & Toned', emoji: '🏄', desc: 'Gọn, săn chắc' },
            { value: 'muscular', label: 'Muscular', emoji: '🦁', desc: 'To, cơ bắp' },
            { value: 'athletic', label: 'Athletic', emoji: '⚽', desc: 'Cân đối, linh hoạt' },
            { value: 'strong', label: 'Strong', emoji: '🐻', desc: 'Mạnh mẽ, vững chắc' },
        ]
    },
    {
        id: 'targetFrequency',
        question: 'Muốn tập mấy buổi mỗi tuần',
        type: 'card',
        options: [
            { value: '3', label: '3 buổi', emoji: '📅' },
            { value: '4', label: '4 buổi', emoji: '📅' },
            { value: '5', label: '5 buổi', emoji: '📅' },
            { value: '6', label: '6 buổi', emoji: '📅' },
        ]
    },
    {
        id: 'preferredTime',
        question: 'Khung giờ bạn thường tập',
        type: 'card',
        options: [
            { value: 'morning', label: 'Buổi sáng', emoji: '🌅', desc: '5h – 10h' },
            { value: 'afternoon', label: 'Buổi trưa', emoji: '☀️', desc: '11h – 14h' },
            { value: 'evening', label: 'Buổi tối', emoji: '🌙', desc: '17h – 22h' },
            { value: 'flexible', label: 'Linh hoạt', emoji: '🔄', desc: 'Tuỳ ngày' },
        ]
    },
    {
        id: 'motivation',
        question: 'Lý do bạn tập gym',
        type: 'card',
        options: [
            { value: 'health', label: 'Sức khỏe', emoji: '❤️', desc: 'Sống lâu, khỏe mạnh' },
            { value: 'appearance', label: 'Ngoại hình', emoji: '🪞', desc: 'Đẹp hơn, tự tin hơn' },
            { value: 'confidence', label: 'Tự tin', emoji: '🦁', desc: 'Cảm thấy mạnh mẽ' },
            { value: 'sport', label: 'Thi đấu', emoji: '🏆', desc: 'Nâng cao thể thao' },
        ]
    },
    {
        id: 'commitment',
        question: 'Mức độ cam kết của bạn',
        type: 'card',
        options: [
            { value: 'casual', label: 'Thử xem sao', emoji: '🌱', desc: 'Chưa chắc chắn' },
            { value: 'serious', label: 'Nghiêm túc', emoji: '🎯', desc: 'Muốn kết quả thật' },
            { value: 'hardcore', label: 'Cực kỳ quyết tâm', emoji: '🔥', desc: 'All in, không bỏ cuộc' },
        ]
    },
]

export default function Onboarding({ onComplete }) {
    const { user } = useAuth()
    const [step, setStep] = useState(0)
    const [answers, setAnswers] = useState({})
    const [saving, setSaving] = useState(false)
    const [animDir, setAnimDir] = useState('forward') // 'forward' | 'back'
    const [visible, setVisible] = useState(true)

    const current = STEPS[step]
    const progress = ((step) / STEPS.length) * 100

    const answer = answers[current.id]

    // Global Enter key listener
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Enter' && canNext() && !saving) goNext()
        }
        window.addEventListener('keydown', handleKey)
        return () => window.removeEventListener('keydown', handleKey)
    }, [answers, step, saving])

    const canNext = () => {
        if (current.type === 'number') return answer && answer.length > 0
        if (current.type === 'multicard') return answer && answer.length > 0
        return !!answer
    }

    const goNext = async () => {
        if (!canNext()) return
        if (step < STEPS.length - 1) {
            setVisible(false)
            setAnimDir('forward')
            setTimeout(() => { setStep(s => s + 1); setVisible(true) }, 200)
        } else {
            await saveAndComplete()
        }
    }

    const goBack = () => {
        if (step === 0) return
        setVisible(false)
        setAnimDir('back')
        setTimeout(() => { setStep(s => s - 1); setVisible(true) }, 200)
    }

    const selectOption = (value) => {
        if (current.type === 'multicard') {
            const prev = answers[current.id] || []
            if (value === 'none') {
                setAnswers(a => ({ ...a, [current.id]: ['none'] }))
            } else {
                const filtered = prev.filter(v => v !== 'none')
                if (filtered.includes(value)) {
                    setAnswers(a => ({ ...a, [current.id]: filtered.filter(v => v !== value) }))
                } else {
                    setAnswers(a => ({ ...a, [current.id]: [...filtered, value] }))
                }
            }
        } else {
            setAnswers(a => ({ ...a, [current.id]: value }))
            // Auto advance after short delay
            setTimeout(() => {
                if (step < STEPS.length - 1) {
                    setVisible(false)
                    setAnimDir('forward')
                    setTimeout(() => { setStep(s => s + 1); setVisible(true) }, 200)
                }
            }, 300)
        }
    }

    const saveAndComplete = async () => {
        setSaving(true)
        try {
            // Clean undefined values
            const clean = (obj) => Object.fromEntries(
                Object.entries(obj).filter(([, v]) => v !== undefined && v !== null)
            )
            const profile = {
                ...clean(answers),
                onboardingCompleted: true,
                onboardingCompletedAt: serverTimestamp(),
                hardMemory: clean({
                    gender: answers.gender || '',
                    ageGroup: answers.ageGroup || '',
                    height: answers.height || '',
                    weight: answers.weight || '',
                    bodyType: answers.bodyType || '',
                    injuries: answers.injuries || [],
                }),
                softMemory: {
                    experience: answers.experience,
                    location: answers.location,
                    currentFrequency: answers.currentFrequency,
                    mainGoal: answers.mainGoal,
                    targetBody: answers.targetBody,
                    targetFrequency: answers.targetFrequency,
                    preferredTime: answers.preferredTime,
                    motivation: answers.motivation,
                    commitment: answers.commitment,
                    dislikes: [],
                    likes: [],
                    notes: [],
                }
            }
            await setDoc(doc(db, 'users', user.uid, 'profile', 'info'), profile, { merge: true })
            // Set localStorage flag trước
            localStorage.setItem(`onboarding_${user.uid}`, '1')
            // Gọi callback để App.jsx re-render
            onComplete(profile)
        } catch (e) {
            console.error('Save error:', e)
            alert('Có lỗi khi lưu, thử lại nhé!')
        }
        setSaving(false)
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: '#09090b',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: "'Inter', sans-serif",
        }}>
            {/* Progress bar */}
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}>
                <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)' }}>
                    <div style={{
                        height: '100%',
                        width: `${progress}%`,
                        background: 'var(--accent, #e11d48)',
                        transition: 'width 0.4s ease',
                        boxShadow: '0 0 12px rgba(225,29,72,0.5)',
                    }} />
                </div>

                {/* Top nav */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 20px',
                    background: '#09090b',
                }}>
                    <button
                        onClick={goBack}
                        disabled={step === 0}
                        style={{
                            background: 'transparent', border: 'none',
                            color: step === 0 ? 'transparent' : 'rgba(255,255,255,0.4)',
                            cursor: step === 0 ? 'default' : 'pointer',
                            width: 'auto', padding: '4px',
                            transition: 'color 0.15s',
                        }}
                        onMouseEnter={e => { if (step > 0) e.currentTarget.style.color = '#fff' }}
                        onMouseLeave={e => e.currentTarget.style.color = step === 0 ? 'transparent' : 'rgba(255,255,255,0.4)'}
                    >
                        <ChevronLeft size={20} />
                    </button>

                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', fontVariantNumeric: 'tabular-nums' }}>
                        {step + 1} / {STEPS.length}
                    </span>

                    <div style={{ width: '28px' }} />
                </div>
            </div>

            {/* Content */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '80px 20px 120px',
                maxWidth: '480px',
                margin: '0 auto',
                width: '100%',
            }}>
                {/* Question */}
                <div style={{
                    opacity: visible ? 1 : 0,
                    transform: visible
                        ? 'translateY(0)'
                        : animDir === 'forward' ? 'translateY(-16px)' : 'translateY(16px)',
                    transition: 'opacity 0.2s ease, transform 0.2s ease',
                    width: '100%',
                }}>
                    <h2 style={{
                        fontSize: '24px',
                        fontWeight: 700,
                        color: '#fff',
                        textAlign: 'center',
                        marginBottom: '8px',
                        lineHeight: 1.3,
                    }}>
                        {current.question}
                    </h2>

                    {current.type === 'multicard' && (
                        <p style={{ textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.35)', marginBottom: '24px' }}>
                            Có thể chọn nhiều
                        </p>
                    )}

                    {!current.type?.includes('card') && <div style={{ marginBottom: '24px' }} />}
                    {current.type?.includes('card') && <div style={{ marginBottom: '24px' }} />}

                    {/* Number input */}
                    {current.type === 'number' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
                            <input
                                type="number"
                                placeholder={current.placeholder}
                                value={answer || ''}
                                onChange={e => setAnswers(a => ({ ...a, [current.id]: e.target.value }))}
                                min={current.min}
                                max={current.max}
                                style={{
                                    width: '140px',
                                    padding: '16px 20px',
                                    fontSize: '28px',
                                    fontWeight: 700,
                                    textAlign: 'center',
                                    background: '#18181b',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    color: '#fff',
                                    outline: 'none',
                                }}
                                onKeyDown={e => e.key === 'Enter' && canNext() && goNext()}
                                onFocus={e => e.target.style.borderColor = 'var(--accent, #e11d48)'}
                                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                            />
                            <span style={{ fontSize: '18px', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
                                {current.unit}
                            </span>
                        </div>
                    )}

                    {/* Card options */}
                    {(current.type === 'card' || current.type === 'multicard') && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {current.options.map(opt => {
                                const isSelected = current.type === 'multicard'
                                    ? (answers[current.id] || []).includes(opt.value)
                                    : answers[current.id] === opt.value

                                return (
                                    <div
                                        key={opt.value}
                                        onClick={() => selectOption(opt.value)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '16px',
                                            padding: '16px 18px',
                                            background: isSelected ? 'rgba(225,29,72,0.1)' : '#18181b',
                                            border: `1px solid ${isSelected ? 'rgba(225,29,72,0.6)' : 'rgba(255,255,255,0.07)'}`,
                                            borderRadius: '12px',
                                            cursor: 'pointer',
                                            transition: 'all 0.15s',
                                            position: 'relative',
                                        }}
                                        onMouseEnter={e => {
                                            if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'
                                        }}
                                        onMouseLeave={e => {
                                            if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
                                        }}
                                    >
                                        <span style={{ fontSize: '22px', flexShrink: 0 }}>{opt.emoji}</span>
                                        <div style={{ flex: 1 }}>
                                            <div style={{
                                                fontSize: '15px',
                                                fontWeight: isSelected ? 600 : 400,
                                                color: isSelected ? '#fff' : 'rgba(255,255,255,0.75)',
                                            }}>
                                                {opt.label}
                                            </div>
                                            {opt.desc && (
                                                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>
                                                    {opt.desc}
                                                </div>
                                            )}
                                        </div>
                                        {isSelected && (
                                            <div style={{
                                                width: '20px', height: '20px',
                                                borderRadius: '50%',
                                                background: 'var(--accent, #e11d48)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                flexShrink: 0,
                                            }}>
                                                <Check size={12} color="#fff" strokeWidth={3} />
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom CTA */}
            <div style={{
                position: 'fixed', bottom: 0, left: 0, right: 0,
                padding: '16px 20px 32px',
                background: 'linear-gradient(to top, #09090b 60%, transparent)',
            }}>
                <div style={{ maxWidth: '480px', margin: '0 auto' }}>
                    {(current.type === 'number' || current.type === 'multicard') && (
                        <button
                            onClick={goNext}
                            disabled={!canNext() || saving}
                            style={{
                                width: '100%',
                                padding: '16px',
                                fontSize: '15px',
                                fontWeight: 600,
                                background: canNext() ? 'var(--accent, #e11d48)' : 'rgba(255,255,255,0.08)',
                                border: 'none',
                                borderRadius: '12px',
                                color: canNext() ? '#fff' : 'rgba(255,255,255,0.3)',
                                cursor: canNext() ? 'pointer' : 'not-allowed',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                            }}
                        >
                            {saving ? 'Đang lưu...' : step === STEPS.length - 1 ? 'Hoàn thành 🎉' : 'Tiếp tục'}
                            {!saving && <ChevronRight size={18} />}
                        </button>
                    )}

                    {current.type === 'card' && step === STEPS.length - 1 && (
                        <button
                            onClick={goNext}
                            disabled={!canNext() || saving}
                            style={{
                                width: '100%', padding: '16px', fontSize: '15px', fontWeight: 600,
                                background: 'var(--accent, #e11d48)', border: 'none', borderRadius: '12px',
                                color: '#fff', cursor: 'pointer',
                            }}
                        >
                            {saving ? 'Đang lưu...' : 'Hoàn thành 🎉'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
