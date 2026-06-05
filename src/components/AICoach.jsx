import { useState, useRef, useEffect } from 'react'
import { Bot, Send } from 'lucide-react'
import { useFood } from '../context/FoodContext'
import { useApp } from '../context/AppContext'
import { callGemini } from '../utils/gemini'

const GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY

// System prompt cố định — không đổi giữa các turn
const buildSystemPrompt = ({ tuoi, canNang, chieuCao, mucTieu, dailyGoal }) => `
Bạn là AI Coach dinh dưỡng và thể hình. Trả lời ngắn gọn, thân thiện, bằng tiếng Việt.

Thông tin người dùng:
- Tuổi: ${tuoi || 'chưa nhập'}, Cân nặng: ${canNang || 'chưa nhập'}kg, Chiều cao: ${chieuCao || 'chưa nhập'}cm
- Mục tiêu: ${mucTieu}
- Mục tiêu calo/ngày: ${dailyGoal.calories} kcal | Protein: ${dailyGoal.protein}g | Carb: ${dailyGoal.carbs}g | Fat: ${dailyGoal.fat}g
`.trim()

function AICoach() {
    const { getTodayTotal, getTodayMeals, getRemaining, dailyGoal } = useFood()
    const { tuoi, canNang, chieuCao, mucTieu } = useApp()

    const [chatInput, setChatInput] = useState('')
    const [chatHistory, setChatHistory] = useState([
        { role: 'ai', content: '👋 Chào bạn! Mình là AI Coach. Hỏi mình bất cứ điều gì về dinh dưỡng hoặc tập luyện nhé!' }
    ])
    // Lưu riêng conversation dạng Gemini API format
    const [apiMessages, setApiMessages] = useState([])
    const [loading, setLoading] = useState(false)
    const chatEndRef = useRef(null)

    const total = getTodayTotal()
    const remaining = getRemaining()

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [chatHistory])

    const handleSend = async (overrideInput) => {
        const message = (overrideInput || chatInput).trim()
        if (!message) return

        // Hiển thị message user
        setChatHistory(prev => [...prev, { role: 'user', content: message }])
        setChatInput('')
        setLoading(true)

        // Build context realtime (nutrition hôm nay) — gắn vào message đầu tiên mỗi lần gửi
        const todayMeals = getTodayMeals()
        const mealList = todayMeals.length > 0
            ? todayMeals.map(m => `- ${m.name || 'Không rõ'}: ${m.calories || 0} kcal, ${m.protein || 0}g protein`).join('\n')
            : '- Chưa ghi nhận bữa nào hôm nay'

        const contextNote = `[Dữ liệu hôm nay của user]
Đã nạp: ${total.calories}/${dailyGoal.calories} kcal | Protein: ${total.protein}/${dailyGoal.protein}g | Carb: ${total.carbs}/${dailyGoal.carbs}g | Fat: ${total.fat}/${dailyGoal.fat}g
Còn thiếu: ${remaining.calories} kcal, ${remaining.protein}g protein
Bữa ăn:
${mealList}

Câu hỏi: ${message}`

        // Build toàn bộ conversation history cho API
        // Turn đầu tiên gắn system + context, các turn sau chỉ gửi message thôi
        const newUserMsg = { role: 'user', parts: [{ text: apiMessages.length === 0 ? `${buildSystemPrompt({ tuoi, canNang, chieuCao, mucTieu, dailyGoal })}\n\n${contextNote}` : contextNote }] }
        const updatedMessages = [...apiMessages, newUserMsg]

        try {
            const data = await callGemini(GEMINI_KEY, {
                contents: updatedMessages,
                generationConfig: { maxOutputTokens: 400 }
            })
            const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Xin lỗi, mình không trả lời được lúc này!'

            // Cập nhật history UI
            setChatHistory(prev => [...prev, { role: 'ai', content: reply }])

            // Cập nhật API conversation history (giữ tối đa 20 turns để tránh token overflow)
            const assistantMsg = { role: 'model', parts: [{ text: reply }] }
            const newHistory = [...updatedMessages, assistantMsg]
            setApiMessages(newHistory.slice(-20))

        } catch {
            setChatHistory(prev => [...prev, { role: 'ai', content: '❌ Lỗi kết nối, thử lại nhé!' }])
        }

        setLoading(false)
    }

    const quickQuestions = ['Tối nay ăn gì?', 'Tổng hôm nay', 'Còn thiếu bao nhiêu?', 'Gợi ý bài tập']

    return (
        <div className="card" style={{ marginTop: '1.5rem' }}>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bot size={16} style={{ color: 'var(--accent)' }} /> AI Coach
            </div>

            {/* Tổng quan hôm nay */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '12px',
                marginBottom: '1rem',
                padding: '0.5rem 0'
            }}>
                {[
                    { label: 'Calo', val: total.calories, goal: dailyGoal.calories, unit: '' },
                    { label: 'Protein', val: total.protein, goal: dailyGoal.protein, unit: 'g' },
                    { label: 'Carb', val: total.carbs, goal: dailyGoal.carbs, unit: 'g' },
                    { label: 'Fat', val: total.fat, goal: dailyGoal.fat, unit: 'g' },
                ].map(({ label, val, goal, unit }) => (
                    <div key={label} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{label}</div>
                        <div style={{ fontSize: '16px', fontWeight: '700', color: val >= goal ? 'var(--accent)' : 'var(--text)' }}>
                            {val}<span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>/{goal}{unit}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Progress bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '1rem' }}>
                {[
                    { label: 'Calo', val: total.calories, goal: dailyGoal.calories, color: '#f59e0b' },
                    { label: 'Protein', val: total.protein, goal: dailyGoal.protein, color: 'var(--accent)' },
                    { label: 'Carb', val: total.carbs, goal: dailyGoal.carbs, color: '#60a5fa' },
                    { label: 'Fat', val: total.fat, goal: dailyGoal.fat, color: '#f97316' },
                ].map(({ label, val, goal, color }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', width: '40px' }}>{label}</span>
                        <div style={{ flex: 1, height: '5px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{
                                width: `${Math.min(100, (val / goal) * 100)}%`,
                                height: '100%',
                                background: color,
                                borderRadius: '3px',
                                transition: 'width 0.4s ease'
                            }} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Chat box */}
            <div style={{
                background: 'var(--card2)',
                borderRadius: '12px',
                padding: '1rem',
                maxHeight: '280px',
                overflowY: 'auto',
                marginBottom: '1rem'
            }}>
                {chatHistory.map((msg, idx) => (
                    <div key={idx} style={{
                        display: 'flex',
                        justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        marginBottom: '12px'
                    }}>
                        <div style={{
                            maxWidth: '82%',
                            padding: '8px 12px',
                            borderRadius: '12px',
                            background: msg.role === 'user' ? 'var(--accent)' : 'var(--card)',
                            color: msg.role === 'user' ? '#000' : 'var(--text)',
                            fontSize: '13px',
                            whiteSpace: 'pre-line',
                            lineHeight: 1.6
                        }}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div style={{ textAlign: 'left', fontSize: '12px', color: 'var(--text-secondary)', padding: '4px 8px' }}>
                        AI Coach đang suy nghĩ...
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div style={{ display: 'flex', gap: '8px' }}>
                <input
                    type="text"
                    placeholder="Hỏi AI Coach..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !loading && handleSend()}
                    style={{ flex: 1 }}
                />
                <button onClick={() => handleSend()} disabled={loading} style={{ width: 'auto', padding: '0 16px' }}>
                    <Send size={16} />
                </button>
            </div>

            {/* Gợi ý nhanh */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                {quickQuestions.map(q => (
                    <button
                        key={q}
                        onClick={() => handleSend(q)}
                        style={{
                            width: 'auto',
                            padding: '6px 12px',
                            fontSize: '12px',
                            background: 'transparent',
                            border: '1px solid var(--border)',
                            color: 'var(--text-secondary)'
                        }}
                    >
                        {q}
                    </button>
                ))}
            </div>
        </div>
    )
}

export default AICoach
