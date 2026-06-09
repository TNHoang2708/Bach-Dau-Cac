import { useState, useRef, useEffect } from 'react'
import { Bot, Send } from 'lucide-react'
import { useFood } from '../context/FoodContext'
import { useApp } from '../context/AppContext'
import { callGemini } from '../utils/gemini'

const GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY

const ONBOARDING = [
    '👋 Chào! Mình là AI Coach của bạn.\n\nBạn đã tập gym được bao lâu rồi? (Ví dụ: mới bắt đầu, 6 tháng, 2 năm...)',
    'Bạn có vấn đề sức khỏe nào cần lưu ý không?\n(Đau lưng, đau gối, huyết áp cao... hoặc gõ "không có")',
    '✅ Tuyệt! Mình đã hiểu về bạn rồi. Hãy bấm **Tạo lịch tập** để mình thiết kế chương trình phù hợp nhé! 💪\n\nHoặc hỏi mình bất cứ điều gì về dinh dưỡng và tập luyện.',
]

function buildSystemPrompt({ tuoi, canNang, chieuCao, mucTieu, dailyGoal, chatContext }) {
    return `Bạn là AI Coach thể hình và dinh dưỡng cá nhân. Trả lời ngắn gọn, thân thiện, bằng tiếng Việt.

Thông tin người dùng:
- Tuổi: ${tuoi || 'chưa nhập'}, Cân nặng: ${canNang || 'chưa nhập'}kg, Chiều cao: ${chieuCao || 'chưa nhập'}cm
- Mục tiêu: ${mucTieu}
- Calo/ngày: ${dailyGoal.calories} kcal | Protein: ${dailyGoal.protein}g | Carb: ${dailyGoal.carbs}g | Fat: ${dailyGoal.fat}g
${chatContext ? `\nThông tin bổ sung:\n${chatContext}` : ''}`
}

function AICoach({ onContextUpdate }) {
    const { getTodayTotal, getTodayMeals, getRemaining, dailyGoal } = useFood()
    const { tuoi, canNang, chieuCao, mucTieu } = useApp()

    const [chatInput, setChatInput] = useState('')
    const [chatHistory, setChatHistory] = useState([{ role: 'ai', content: ONBOARDING[0] }])
    const [apiMessages, setApiMessages] = useState([])
    const [loading, setLoading] = useState(false)
    const [onboardingStep, setOnboardingStep] = useState(0)
    const [chatContext, setChatContext] = useState('')
    const chatEndRef = useRef(null)

    const total = getTodayTotal()
    const remaining = getRemaining()

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [chatHistory])

    useEffect(() => {
        if (onContextUpdate) onContextUpdate(chatContext)
    }, [chatContext])

    const handleSend = async (overrideInput) => {
        const message = (overrideInput || chatInput).trim()
        if (!message || loading) return

        setChatHistory(prev => [...prev, { role: 'user', content: message }])
        setChatInput('')
        setLoading(true)

        // Onboarding step 0: hỏi kinh nghiệm
        if (onboardingStep === 0) {
            const ctx = `Kinh nghiệm tập: ${message}`
            setChatContext(ctx)
            setOnboardingStep(1)
            setTimeout(() => {
                setChatHistory(prev => [...prev, { role: 'ai', content: ONBOARDING[1] }])
                setLoading(false)
            }, 500)
            return
        }

        // Onboarding step 1: hỏi bệnh lý
        if (onboardingStep === 1) {
            const ctx = chatContext + `\nTình trạng sức khỏe: ${message}`
            setChatContext(ctx)
            setOnboardingStep(2)
            setTimeout(() => {
                setChatHistory(prev => [...prev, { role: 'ai', content: ONBOARDING[2] }])
                setLoading(false)
            }, 500)
            return
        }

        // Chat tự do với Gemini
        const todayMeals = getTodayMeals()
        const mealList = todayMeals.length > 0
            ? todayMeals.map(m => `- ${m.name || 'Bữa ăn'}: ${m.calories || 0} kcal`).join('\n')
            : '- Chưa có bữa nào'

        const contextNote = `[Hôm nay] Calo: ${total.calories}/${dailyGoal.calories} | Protein: ${total.protein}/${dailyGoal.protein}g | Còn thiếu: ${remaining.calories} kcal
${mealList}

Câu hỏi: ${message}`

        const systemPrompt = buildSystemPrompt({ tuoi, canNang, chieuCao, mucTieu, dailyGoal, chatContext })
        const newUserMsg = {
            role: 'user',
            parts: [{ text: apiMessages.length === 0 ? `${systemPrompt}\n\n${contextNote}` : contextNote }]
        }
        const updatedMessages = [...apiMessages, newUserMsg]

        try {
            const data = await callGemini(GEMINI_KEY, {
                contents: updatedMessages,
                generationConfig: { maxOutputTokens: 500 }
            })
            const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Xin lỗi, mình không trả lời được!'
            setChatHistory(prev => [...prev, { role: 'ai', content: reply }])
            setApiMessages([...updatedMessages, { role: 'model', parts: [{ text: reply }] }].slice(-20))
        } catch {
            setChatHistory(prev => [...prev, { role: 'ai', content: '❌ Lỗi kết nối, thử lại nhé!' }])
        }

        setLoading(false)
    }

    const quickQuestions = onboardingStep >= 2
        ? ['Tối nay ăn gì?', 'Tổng hôm nay', 'Còn thiếu bao nhiêu?', 'Gợi ý bài tập']
        : []

    return (
        <div className="card" style={{ marginTop: '1.5rem' }}>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bot size={14} style={{ color: 'var(--accent)' }} /> AI COACH
            </div>

            {onboardingStep >= 2 && (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '1rem' }}>
                        {[
                            { label: 'Calo', val: total.calories, goal: dailyGoal.calories, unit: '' },
                            { label: 'Protein', val: total.protein, goal: dailyGoal.protein, unit: 'g' },
                            { label: 'Carb', val: total.carbs, goal: dailyGoal.carbs, unit: 'g' },
                            { label: 'Fat', val: total.fat, goal: dailyGoal.fat, unit: 'g' },
                        ].map(({ label, val, goal, unit }) => (
                            <div key={label} style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{label}</div>
                                <div style={{ fontSize: '16px', fontWeight: 700, color: val >= goal ? 'var(--accent)' : 'var(--text)' }}>
                                    {val}<span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>/{goal}{unit}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '1rem' }}>
                        {[
                            { label: 'Calo', val: total.calories, goal: dailyGoal.calories, color: '#f59e0b' },
                            { label: 'Protein', val: total.protein, goal: dailyGoal.protein, color: 'var(--accent)' },
                            { label: 'Carb', val: total.carbs, goal: dailyGoal.carbs, color: '#60a5fa' },
                            { label: 'Fat', val: total.fat, goal: dailyGoal.fat, color: '#f97316' },
                        ].map(({ label, val, goal, color }) => (
                            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', width: '40px' }}>{label}</span>
                                <div style={{ flex: 1, height: '4px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ width: `${Math.min(100, (val / goal) * 100)}%`, height: '100%', background: color, borderRadius: '4px', transition: 'width 0.4s ease' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            <div style={{ background: 'var(--card2)', borderRadius: '12px', padding: '1rem', maxHeight: '300px', overflowY: 'auto', marginBottom: '1rem' }}>
                {chatHistory.map((msg, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: '12px' }}>
                        <div style={{
                            maxWidth: '82%', padding: '10px 14px', borderRadius: '14px',
                            background: msg.role === 'user' ? 'var(--accent)' : 'var(--card)',
                            color: msg.role === 'user' ? '#fff' : 'var(--text)',
                            fontSize: '13px', whiteSpace: 'pre-line', lineHeight: 1.6,
                            border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
                        }}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {loading && <div style={{ fontSize: '12px', color: 'var(--text-secondary)', padding: '4px 8px' }}>AI Coach đang suy nghĩ...</div>}
                <div ref={chatEndRef} />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
                <input
                    type="text"
                    placeholder={onboardingStep < 2 ? 'Trả lời AI Coach...' : 'Hỏi AI Coach...'}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !loading && handleSend()}
                    style={{ flex: 1 }}
                />
                <button onClick={() => handleSend()} disabled={loading} style={{ width: 'auto', padding: '0 16px' }}>
                    <Send size={15} />
                </button>
            </div>

            {quickQuestions.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                    {quickQuestions.map(q => (
                        <button key={q} onClick={() => handleSend(q)} style={{
                            width: 'auto', padding: '5px 12px', fontSize: '12px',
                            background: 'transparent', border: '1px solid var(--border)',
                            color: 'var(--text-secondary)', borderRadius: '8px',
                        }}>
                            {q}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

export default AICoach
