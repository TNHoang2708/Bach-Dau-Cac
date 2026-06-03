import { useState } from 'react'
import { Bot, Send, TrendingUp, Target } from 'lucide-react'
import { useFood } from '../context/FoodContext'

function AICoach() {
    const { getTodayTotal, getRemaining, getSuggestion, dailyGoal } = useFood()
    const [chatInput, setChatInput] = useState('')
    const [chatHistory, setChatHistory] = useState([
        { role: 'ai', content: ' Chào bạn! Mình là AI Coach. Hôm nay bạn đã ăn gì rồi?' }
    ])
    const [loading, setLoading] = useState(false)

    const total = getTodayTotal()
    const remaining = getRemaining()
    const suggestion = getSuggestion()

    const handleSend = async () => {
        if (!chatInput.trim()) return

        const userMessage = chatInput
        setChatHistory(prev => [...prev, { role: 'user', content: userMessage }])
        setChatInput('')
        setLoading(true)

        // Xử lý câu hỏi của user
        let aiReply = ''
        const lowerInput = userMessage.toLowerCase()

        if (lowerInput.includes('ăn gì') || lowerInput.includes('tối nay')) {
            aiReply = suggestion
        }
        else if (lowerInput.includes('thiếu') || lowerInput.includes('cần thêm')) {
            aiReply = `Bạn còn thiếu ${remaining.protein}g protein và ${remaining.calories} calo. ${suggestion.split('\n\n')[1] || ''}`
        }
        else if (lowerInput.includes('hôm nay') || lowerInput.includes('tổng')) {
            aiReply = ` Tổng kết hôm nay:\n• Calo: ${total.calories}/${dailyGoal.calories}\n• Protein: ${total.protein}/${dailyGoal.protein}g\n• Carb: ${total.carbs}/${dailyGoal.carbs}g\n• Fat: ${total.fat}/${dailyGoal.fat}g`
        }
        else {
            aiReply = ` Đã ghi nhận "${userMessage}". Bạn muốn hỏi gì thêm? Gõ:\n- "Hôm nay ăn gì?"\n- "Tổng hôm nay"\n- "Còn thiếu bao nhiêu?"`
        }

        setChatHistory(prev => [...prev, { role: 'ai', content: aiReply }])
        setLoading(false)
    }

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
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Calo</div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: total.calories >= dailyGoal.calories ? 'var(--accent)' : 'var(--text)' }}>
                        {total.calories}/{dailyGoal.calories}
                    </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Protein</div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: total.protein >= dailyGoal.protein ? 'var(--accent)' : 'var(--text)' }}>
                        {total.protein}/{dailyGoal.protein}g
                    </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Carb</div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: total.carbs >= dailyGoal.carbs ? 'var(--accent)' : 'var(--text)' }}>
                        {total.carbs}/{dailyGoal.carbs}g
                    </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Fat</div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: total.fat >= dailyGoal.fat ? 'var(--accent)' : 'var(--text)' }}>
                        {total.fat}/{dailyGoal.fat}g
                    </div>
                </div>
            </div>

            {/* Progress bar */}
            <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', marginBottom: '1rem', overflow: 'hidden' }}>
                <div style={{
                    width: `${Math.min(100, (total.protein / dailyGoal.protein) * 100)}%`,
                    height: '100%',
                    background: 'var(--accent)',
                    borderRadius: '3px'
                }} />
            </div>

            {/* Chat box */}
            <div style={{
                background: 'var(--card2)',
                borderRadius: '12px',
                padding: '1rem',
                maxHeight: '300px',
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
                            maxWidth: '80%',
                            padding: '8px 12px',
                            borderRadius: '12px',
                            background: msg.role === 'user' ? 'var(--accent)' : 'var(--card)',
                            color: msg.role === 'user' ? '#000' : 'var(--text)',
                            fontSize: '13px',
                            whiteSpace: 'pre-line'
                        }}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        AI Coach đang suy nghĩ...
                    </div>
                )}
            </div>

            {/* Input */}
            <div style={{ display: 'flex', gap: '8px' }}>
                <input
                    type="text"
                    placeholder="Hỏi AI Coach... (VD: tối nay ăn gì?)"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    style={{ flex: 1 }}
                />
                <button onClick={handleSend} style={{ width: 'auto', padding: '0 16px' }}>
                    <Send size={16} />
                </button>
            </div>

            {/* Gợi ý nhanh */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                {['Tối nay ăn gì?', 'Tổng hôm nay', 'Còn thiếu bao nhiêu?'].map(q => (
                    <button
                        key={q}
                        onClick={() => {
                            setChatInput(q)
                            handleSend()
                        }}
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