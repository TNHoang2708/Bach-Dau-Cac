import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, Brain } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useFood } from '../context/FoodContext'
import { db } from '../firebase'
import { doc, getDoc, setDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore'
import { callGemini } from '../utils/gemini'

const GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY

function MessageContent({ text }) {
    const html = text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br/>')
    return <span dangerouslySetInnerHTML={{ __html: html }} />
}

function TypingDots() {
    return (
        <div style={{ display: 'flex', gap: '4px', padding: '4px 0', alignItems: 'center' }}>
            {[0, 1, 2].map(i => (
                <div key={i} style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: 'var(--accent)',
                    animation: `typingDot 1.2s ease-in-out ${i * 0.2}s infinite`,
                }} />
            ))}
            <style>{`
                @keyframes typingDot {
                    0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
                    30% { transform: translateY(-6px); opacity: 1; }
                }
            `}</style>
        </div>
    )
}

async function loadMemory(uid) {
    try {
        const snap = await getDoc(doc(db, 'users', uid, 'profile', 'info'))
        if (!snap.exists()) return null
        return snap.data()
    } catch { return null }
}

async function updateSoftMemory(uid, newInfo) {
    try {
        await setDoc(
            doc(db, 'users', uid, 'profile', 'info'),
            { softMemory: { notes: arrayUnion(newInfo) } },
            { merge: true }
        )
    } catch (e) { console.error('Memory update error:', e) }
}

async function updateEmotionalMemory(uid, mood, context) {
    try {
        const entry = { mood, context, timestamp: new Date().toISOString() }
        await setDoc(
            doc(db, 'users', uid, 'profile', 'info'),
            {
                emotionalMemory: {
                    recentMoods: arrayUnion(entry),
                    lastEmotionalState: mood,
                }
            },
            { merge: true }
        )
    } catch (e) { console.error('Emotional memory error:', e) }
}

async function updateSessionMeta(uid, topics = []) {
    try {
        await setDoc(
            doc(db, 'users', uid, 'profile', 'info'),
            {
                sessionMeta: {
                    lastSeenAt: new Date().toISOString(),
                    lastTopics: topics,
                }
            },
            { merge: true }
        )
    } catch (e) { console.error('Session meta error:', e) }
}

function daysSinceLastSeen(lastSeenAt) {
    if (!lastSeenAt) return null
    const diff = Date.now() - new Date(lastSeenAt).getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24))
}

function buildGreeting(name, mem) {
    const goal = mem?.softMemory?.mainGoal
    const goalText = goal === 'muscle_gain' ? 'tăng cơ' :
        goal === 'fat_loss' ? 'giảm mỡ' :
            goal === 'strength' ? 'tăng sức mạnh' : 'cải thiện sức khỏe'

    const lastMood = mem?.emotionalMemory?.lastEmotionalState
    const days = daysSinceLastSeen(mem?.sessionMeta?.lastSeenAt)
    const notes = mem?.softMemory?.notes || []
    const lastNote = notes[notes.length - 1]

    if (days === null) {
        return `Chào ${name}! Mình là AI Coach của bạn.\n\nMình nhớ bạn đang hướng tới mục tiêu **${goalText}**. Hôm nay bạn cần mình giúp gì?`
    }

    if (days >= 7) {
        return `Chào ${name}, lâu rồi mới gặp lại — ${days} ngày rồi đó!\n\nMình vẫn nhớ bạn đang hướng tới **${goalText}**. Dạo này thế nào, có ổn không?`
    }

    if (days >= 2) {
        return `Chào ${name}! ${days} ngày rồi mới thấy bạn.\n\n${lastNote ? `Lần trước mình có ghi lại: "${lastNote}". ` : ''}Hôm nay bạn thế nào?`
    }

    if (lastMood === 'tired' || lastMood === 'stressed' || lastMood === 'sad') {
        return `Chào ${name}! Hôm qua bạn có vẻ không được ổn lắm.\n\nHôm nay cảm thấy thế nào rồi? Nghỉ ngơi đủ chưa?`
    }

    return `Chào ${name}! Hôm nay mình có thể giúp gì cho bạn?`
}

// [BƯỚC 3] System prompt với emotional detection chủ động + proactive recall
function buildSystemPrompt(memory, todayData) {
    const hard = memory?.hardMemory || {}
    const soft = memory?.softMemory || {}
    const emotional = memory?.emotionalMemory || {}

    const hardText = `
- Giới tính: ${hard.gender || '?'}
- Độ tuổi: ${hard.ageGroup || '?'}
- Chiều cao: ${hard.height || '?'}cm, Cân nặng: ${hard.weight || '?'}kg
- Vóc dáng: ${hard.bodyType || '?'}
- Chấn thương/bệnh lý: ${(hard.injuries || []).join(', ') || 'Không có'}`

    const softText = `
- Mục tiêu: ${soft.mainGoal || '?'}
- Cơ thể hướng tới: ${soft.targetBody || '?'}
- Kinh nghiệm: ${soft.experience || '?'}
- Tập tại: ${soft.location || '?'}
- Số buổi/tuần muốn tập: ${soft.targetFrequency || '?'}
- Khung giờ tập: ${soft.preferredTime || '?'}
- Động lực: ${soft.motivation || '?'}
- Cam kết: ${soft.commitment || '?'}
- Không thích: ${(soft.dislikes || []).join(', ') || 'chưa biết'}
- Thích: ${(soft.likes || []).join(', ') || 'chưa biết'}
- Ghi chú từ các buổi trước: ${(soft.notes || []).slice(-5).join(' | ') || 'chưa có'}`

    const emotionalText = `
- Trạng thái cảm xúc gần nhất: ${emotional.lastEmotionalState || 'chưa có'}
- Lịch sử tâm trạng: ${(emotional.recentMoods || []).slice(-3).map(m => `${m.mood} (${m.context})`).join(', ') || 'chưa có'}`

    const todayText = todayData ? `
- Đã nạp: ${todayData.calories}/${todayData.goalCalories} kcal
- Protein: ${todayData.protein}/${todayData.goalProtein}g
- Còn thiếu: ${Math.max(0, todayData.goalCalories - todayData.calories)} kcal` : '\n- Chưa có dữ liệu'

    return `Bạn là AI Coach thể hình & dinh dưỡng cá nhân. Bạn NHỚ người dùng này và đồng hành lâu dài cùng họ.

TÍNH CÁCH: Thân thiện, quan tâm, lắng nghe thật sự. Không phải chatbot — bạn là người bạn đồng hành của user.

[Thông tin cơ bản]${hardText}

[Sở thích & thói quen]${softText}

[Cảm xúc & tâm trạng]${emotionalText}

[Hôm nay]${todayText}

QUY TẮC:
1. Trả lời bằng tiếng Việt, tự nhiên như người thật — không cứng nhắc, không robot
2. NHẬN DIỆN CẢM XÚC CHỦ ĐỘNG: Dù user không nói thẳng là mệt/stress, hãy đọc tone của họ. Trả lời cụt, "oke", "hmm", im lặng rồi hỏi ngắn — đều có thể là dấu hiệu không ổn. Khi nghi ngờ, hỏi nhẹ nhàng
3. KHI USER ĐANG KHÔNG ỔN: Lắng nghe trước — hỏi thêm — KHÔNG push lịch tập hay calo ngay. Đợi user sẵn sàng rồi mới tư vấn
4. KHI USER HỎI TƯ VẤN: Trả lời cụ thể dựa trên thông tin của họ, không chung chung
5. PROACTIVE RECALL — nhắc lại thông tin user đã chia sẻ đúng lúc, tự nhiên. Ví dụ: nếu user hỏi lịch tập mà mình biết họ ghét cardio thì không đưa cardio vào. Nếu user nói mệt mà trước đó từng kể hay bị stress vì công việc thì có thể nhắc lại nhẹ. KHÔNG nhắc máy móc kiểu "theo thông tin của bạn thì..."
6. Nếu user chia sẻ thông tin mới quan trọng → cuối reply thêm: [MEMORY: nội dung ngắn gọn]
7. Nếu detect được user đang mệt/stressed/buồn/không ổn (dù họ không nói thẳng) → cuối reply thêm: [EMOTION: mood|lý do ngắn gọn]
   - mood chỉ dùng: tired / stressed / sad / motivated / happy / neutral
8. Không hỏi lại những gì user đã trả lời trong onboarding`
}

const QUICK_REPLIES = [
    'Lịch tập hôm nay?',
    'Gợi ý bữa ăn?',
    'Tiến độ của tôi',
    'Hôm nay mệt mỏi',
]

export default function AICoach() {
    const { user } = useAuth()
    const { getTodayTotal, dailyGoal } = useFood()
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [apiMessages, setApiMessages] = useState([])
    const [memory, setMemory] = useState(null)
    const [memoryLoaded, setMemoryLoaded] = useState(false)
    const chatEndRef = useRef(null)

    useEffect(() => {
        if (!user) return
        loadMemory(user.uid).then(mem => {
            setMemory(mem)
            setMemoryLoaded(true)

            const name = user.displayName?.split(' ').pop() || 'bạn'
            const greeting = buildGreeting(name, mem)
            setMessages([{ role: 'ai', content: greeting }])

            updateSessionMeta(user.uid)
        })
    }, [user])

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSend = async (overrideInput) => {
        const msg = (overrideInput || input).trim()
        if (!msg || loading) return

        setMessages(prev => [...prev, { role: 'user', content: msg }])
        setInput('')
        setLoading(true)

        const total = getTodayTotal()
        const todayData = {
            calories: total.calories,
            goalCalories: dailyGoal.calories,
            protein: total.protein,
            goalProtein: dailyGoal.protein,
        }

        const systemPrompt = buildSystemPrompt(memory, todayData)
        const newUserMsg = {
            role: 'user',
            parts: [{ text: apiMessages.length === 0 ? `${systemPrompt}\n\nUser: ${msg}` : msg }]
        }
        const updatedMessages = [...apiMessages, newUserMsg]

        try {
            const data = await callGemini(GEMINI_KEY, {
                contents: updatedMessages,
                generationConfig: { maxOutputTokens: 600 }
            })
            let reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Xin lỗi, mình không trả lời được!'

            const memoryMatch = reply.match(/\[MEMORY:\s*(.+?)\]/s)
            if (memoryMatch && user) {
                const memNote = memoryMatch[1].trim()
                updateSoftMemory(user.uid, memNote)
                setMemory(prev => ({
                    ...prev,
                    softMemory: {
                        ...(prev?.softMemory || {}),
                        notes: [...(prev?.softMemory?.notes || []), memNote]
                    }
                }))
                reply = reply.replace(/\[MEMORY:.*?\]/s, '').trim()
            }

            const emotionMatch = reply.match(/\[EMOTION:\s*(.+?)\|(.+?)\]/s)
            if (emotionMatch && user) {
                const mood = emotionMatch[1].trim()
                const context = emotionMatch[2].trim()
                updateEmotionalMemory(user.uid, mood, context)
                setMemory(prev => ({
                    ...prev,
                    emotionalMemory: {
                        ...(prev?.emotionalMemory || {}),
                        lastEmotionalState: mood,
                        recentMoods: [
                            ...(prev?.emotionalMemory?.recentMoods || []).slice(-9),
                            { mood, context, timestamp: new Date().toISOString() }
                        ]
                    }
                }))
                reply = reply.replace(/\[EMOTION:.*?\]/s, '').trim()
            }

            setMessages(prev => [...prev, { role: 'ai', content: reply }])
            setApiMessages([...updatedMessages, { role: 'model', parts: [{ text: reply }] }].slice(-20))
        } catch {
            setMessages(prev => [...prev, { role: 'ai', content: 'Lỗi kết nối, thử lại nhé!' }])
        }

        setLoading(false)
    }

    if (!memoryLoaded) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: 'var(--text-secondary)', fontSize: '13px', gap: '8px' }}>
                <div className="spinner" style={{ width: '16px', height: '16px' }} />
                Đang tải AI Coach...
            </div>
        )
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '500px' }}>
            <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '0 0 1rem 0',
                borderBottom: '1px solid var(--border)',
                marginBottom: '1rem',
            }}>
                <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: 'var(--accent-dim)', border: '1px solid rgba(225,29,72,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Sparkles size={16} color='var(--accent)' />
                </div>
                <div>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text)' }}>AI Coach</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#22c55e' }} />
                        Trực tuyến · Có trí nhớ
                    </div>
                </div>
                {memory?.softMemory?.notes?.length > 0 && (
                    <div style={{
                        marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px',
                        fontSize: '11px', color: 'var(--text-muted)',
                        background: 'var(--card2)', padding: '4px 8px', borderRadius: '6px',
                    }}>
                        <Brain size={11} />
                        {memory.softMemory.notes.length} ký ức
                    </div>
                )}
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '1rem' }}>
                {messages.map((msg, idx) => (
                    <div key={idx} style={{
                        display: 'flex',
                        justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    }}>
                        <div style={{
                            maxWidth: '80%',
                            padding: '10px 14px',
                            borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                            background: msg.role === 'user' ? 'var(--accent)' : 'var(--card2)',
                            color: msg.role === 'user' ? '#fff' : 'var(--text)',
                            fontSize: '13px', lineHeight: 1.6,
                            border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
                        }}>
                            <MessageContent text={msg.content} />
                        </div>
                    </div>
                ))}
                {loading && (
                    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <div style={{
                            padding: '10px 14px', borderRadius: '14px 14px 14px 4px',
                            background: 'var(--card2)', border: '1px solid var(--border)',
                        }}>
                            <TypingDots />
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                {QUICK_REPLIES.map(q => (
                    <button key={q} onClick={() => handleSend(q)} style={{
                        width: 'auto', padding: '6px 12px', fontSize: '12px',
                        background: 'var(--card2)', border: '1px solid var(--border)',
                        color: 'var(--text-secondary)', borderRadius: '20px',
                        transition: 'all 0.15s',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
                    >
                        {q}
                    </button>
                ))}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
                <input
                    type="text"
                    placeholder="Nhắn tin với AI Coach..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !loading && handleSend()}
                    style={{ flex: 1, borderRadius: '10px' }}
                />
                <button
                    onClick={() => handleSend()}
                    disabled={loading || !input.trim()}
                    style={{ width: 'auto', padding: '0 16px', borderRadius: '10px' }}
                >
                    <Send size={15} />
                </button>
            </div>
        </div>
    )
}
