import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, Brain } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useFood } from '../context/FoodContext'
import { useApp } from '../context/AppContext'
import { db } from '../firebase'
import { doc, getDoc, setDoc, arrayUnion, collection, addDoc, query, orderBy, limit, getDocs, deleteDoc } from 'firebase/firestore'
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
                    lastEmotionalAt: new Date().toISOString(),
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

// Lưu message vào Firestore (giới hạn 50 tin nhắn gần nhất)
async function saveChatMessage(uid, message) {
    try {
        const colRef = collection(db, 'users', uid, 'chatHistory')
        await addDoc(colRef, {
            ...message,
            // schedule là object, cần stringify để lưu
            schedule: message.schedule ? JSON.stringify(message.schedule) : null,
            savedAt: new Date().toISOString(),
        })
        // Giữ chỉ 50 tin nhắn mới nhất — xóa cũ hơn
        const q = query(colRef, orderBy('savedAt', 'desc'))
        const snap = await getDocs(q)
        if (snap.docs.length > 50) {
            const toDelete = snap.docs.slice(50)
            await Promise.all(toDelete.map(d => deleteDoc(d.ref)))
        }
    } catch (e) { console.error('Save chat error:', e) }
}

async function loadChatHistory(uid) {
    try {
        const q = query(
            collection(db, 'users', uid, 'chatHistory'),
            orderBy('savedAt', 'asc'),
            limit(50)
        )
        const snap = await getDocs(q)
        return snap.docs.map(d => {
            const data = d.data()
            return {
                ...data,
                schedule: data.schedule ? JSON.parse(data.schedule) : undefined,
            }
        })
    } catch (e) { console.error('Load chat error:', e); return [] }
}

function daysSince(isoString) {
    if (!isoString) return null
    return Math.floor((Date.now() - new Date(isoString).getTime()) / (1000 * 60 * 60 * 24))
}

// Decay thông minh theo loại sự kiện
// - mệt/stressed: 3 ngày (chuyện nhỏ, hỏi lại ngay hôm sau ok)
// - sad/buồn chuyện cá nhân: 7 ngày (đủ để hỏi thăm mà không kỳ)
// - heavy (chia tay, gia đình, mất mát): KHÔNG tự gợi lại, chỉ phản hồi nếu user tự nhắc
const MOOD_DECAY_DAYS = {
    tired: 3,
    stressed: 3,
    sad: 7,
    motivated: 2,
    happy: 2,
    neutral: 1,
}

const HEAVY_CONTEXTS = ['chia tay', 'mất', 'gia đình', 'người thân', 'bệnh', 'tai nạn', 'ly hôn', 'thất nghiệp']

function isHeavyContext(context = '') {
    return HEAVY_CONTEXTS.some(k => context.toLowerCase().includes(k))
}

function getActiveEmotionalState(emotionalMemory) {
    const last = emotionalMemory?.lastEmotionalState
    const lastAt = emotionalMemory?.lastEmotionalAt
    const lastContext = emotionalMemory?.recentMoods?.slice(-1)[0]?.context || ''
    if (!last || !lastAt) return null
    // Heavy context → không gợi lại tự động
    if (isHeavyContext(lastContext)) return null
    const decay = MOOD_DECAY_DAYS[last] ?? 3
    const days = daysSince(lastAt)
    if (days === null || days > decay) return null
    return last
}

function getRecentMoods(emotionalMemory) {
    return (emotionalMemory?.recentMoods || []).filter(m => {
        const decay = MOOD_DECAY_DAYS[m.mood] ?? 7
        const days = daysSince(m.timestamp)
        return days !== null && days <= decay && !isHeavyContext(m.context)
    })
}

function buildGreeting(name, mem) {
    const goal = mem?.softMemory?.mainGoal
    const goalText = goal === 'muscle_gain' ? 'tăng cơ' :
        goal === 'fat_loss' ? 'giảm mỡ' :
            goal === 'strength' ? 'tăng sức mạnh' : 'cải thiện sức khỏe'

    const lastMood = getActiveEmotionalState(mem?.emotionalMemory)
    const days = daysSince(mem?.sessionMeta?.lastSeenAt)
    const notes = mem?.softMemory?.notes || []
    const lastNote = notes[notes.length - 1]
    const lastTopics = mem?.sessionMeta?.lastTopics || []

    if (days === null) {
        return `Chào ${name}! Mình là AI Coach của bạn 👋\n\nMình thấy bạn đang hướng tới mục tiêu **${goalText}** — nghe hay đấy!\n\nĐể mình tạo lịch tập phù hợp cho bạn, cho mình hỏi nhanh: **bạn muốn tập mấy buổi mỗi tuần?** (3, 4, 5 hay 6 buổi?)`
    }

    if (days >= 14) {
        return `Ủa ${name}! Lâu quá mới thấy bạn — ${days} ngày rồi đó. Dạo này thế nào, vẫn ổn chứ?`
    }

    if (days >= 7) {
        return `Chào ${name}! Cũng lâu rồi mới gặp, ${days} ngày nha.\n\nDạo này bạn có tập không, hay đang bận?`
    }

    if (days >= 2) {
        const noteHint = lastNote ? `Hôm trước bạn có kể "${lastNote}" — ` : ''
        return `Chào ${name}! ${noteHint}Hôm nay thế nào rồi?`
    }

    // Hôm qua mood không ổn → hỏi thăm tự nhiên, không checklist
    if (lastMood === 'tired') {
        return `${name} ơi, hôm qua trông có vẻ mệt — hôm nay ngủ được không, cảm thấy đỡ hơn chưa?`
    }
    if (lastMood === 'stressed') {
        return `Chào ${name}! Hôm qua bạn đang căng thẳng — hôm nay bớt chưa? Có muốn kể thêm không?`
    }
    if (lastMood === 'sad') {
        return `${name} ơi, hôm nay cảm thấy thế nào rồi? Mình vẫn ở đây nha.`
    }
    if (lastMood === 'motivated' || lastMood === 'happy') {
        return `Chào ${name}! Hôm qua bạn đang rất năng lượng — hôm nay tiếp tục chiến không? 💪`
    }

    if (lastTopics.length > 0) {
        return `Chào ${name}! Hôm qua mình đang nói về **${lastTopics[0]}** — hôm nay muốn tiếp không, hay có chuyện khác?`
    }

    return `Chào ${name}! Hôm nay mình có thể giúp gì cho bạn?`
}

function buildSystemPrompt(memory, todayData) {
    const hard = memory?.hardMemory || {}
    const soft = memory?.softMemory || {}
    const session = memory?.sessionMeta || {}

    const recentMoods = getRecentMoods(memory?.emotionalMemory)
    const lastEmotionalState = getActiveEmotionalState(memory?.emotionalMemory)

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

    const emotionalText = lastEmotionalState
        ? `\n- Tâm trạng gần đây: ${recentMoods.slice(-3).map(m => `${m.mood} (${m.context})`).join(', ')}`
        : `\n- Tâm trạng: không có dữ liệu cần nhắc lại`

    const sessionText = `\n- Chủ đề buổi trước: ${(session.lastTopics || []).join(', ') || 'chưa có'}`

    const todayText = todayData ? `
- Đã nạp: ${todayData.calories}/${todayData.goalCalories} kcal
- Protein: ${todayData.protein}/${todayData.goalProtein}g
- Còn thiếu: ${Math.max(0, todayData.goalCalories - todayData.calories)} kcal` : '\n- Chưa có dữ liệu'

    return `Bạn là người bạn đồng hành — vừa là AI Coach thể hình, vừa là người lắng nghe thật sự. Mục tiêu của app này là giúp user hiểu tầm quan trọng của việc tập luyện, nhưng trước hết phải là người bạn họ muốn tâm sự.

TÍNH CÁCH: Ấm áp, tự nhiên, không cứng nhắc. Nói như bạn bè nhắn tin — không dùng bullet point hay tiêu đề. Ngắn gọn khi phù hợp, dài hơn khi user cần được lắng nghe.

[Thông tin cơ bản — nhớ mãi]${hardText}

[Sở thích & thói quen]${softText}

[Cảm xúc gần đây]${emotionalText}

[Buổi trước]${sessionText}

[Dinh dưỡng hôm nay]${todayText}

QUY TẮC QUAN TRỌNG:
1. Trả lời tiếng Việt, tự nhiên như người thật nhắn tin
2. PHÂN BIỆT 2 MODE:
   - MODE TÂM SỰ: user buồn/mệt/stress/kể chuyện cá nhân → lắng nghe, hỏi thêm, đồng cảm. TUYỆT ĐỐI không chen lịch tập hay dinh dưỡng vào. Mục tiêu KHÔNG chỉ là nghe — sau khi nói chuyện, user phải thấy NHẸ NHÕM hơn, được THẤU HIỂU hơn lúc bắt đầu. Validate cảm xúc của họ trước (đừng vội bảo "đừng buồn nữa" hay ép tích cực), rồi mới nhẹ nhàng đưa góc nhìn khác hoặc một câu động viên thật lòng, đúng ngữ cảnh — không sáo rỗng, không giáo điều
   - MODE TƯ VẤN: user hỏi về tập luyện/dinh dưỡng → trả lời cụ thể, có ích
3. ĐỌC TONE: "oke", "hmm", "thôi", trả lời cụt → có thể đang không ổn, hỏi nhẹ
4. EMOTIONAL MEMORY: chấn thương/bệnh lý nhớ mãi. Chuyện cảm xúc nặng (chia tay, mất người thân, gia đình) — KHÔNG tự gợi lại, chỉ phản hồi nếu user tự nhắc
5. KHI CHUYỂN TỪ TÂM SỰ SANG TẬP LUYỆN: phải tự nhiên, không đột ngột. Ví dụ: "Khi nào bạn thấy sẵn sàng hơn, tập luyện cũng có thể giúp đầu óc nhẹ hơn đấy — nhưng không cần vội"
6. Nếu user chia sẻ thông tin quan trọng → cuối reply: [MEMORY: nội dung ngắn]
7. Nếu detect cảm xúc rõ → cuối reply: [EMOTION: mood|context ngắn]
   - mood: tired / stressed / sad / motivated / happy / neutral
   - context: mô tả ngắn lý do (VD: "mệt vì công việc", "buồn chuyện gia đình")
8. Cuối reply → [TOPIC: chủ đề ngắn]
9. Không hỏi lại những gì user đã điền trong onboarding (tuổi, cân, cao, mục tiêu...)
10. TẠO LỊCH TẬP: Khi user trả lời muốn tập X buổi/tuần (hoặc nhắn muốn tạo lịch tập), hãy generate lịch tập JSON ngay. Format: [SCHEDULE:[{"day":"Thứ 2","group":"PUSH","exercises":[{"name":"Bench Press","sets":"4","reps":"8-10"}]}]] — JSON thuần, không markdown trong tag
11. KHI USER CẢM ƠN / bày tỏ biết ơn (vd "cảm ơn nha", "thanks", "có bạn vui hơn nhiều"): đáp lại ấm áp, tự nhiên như bạn bè — KHÔNG dùng kiểu "Dạ, không có gì" khô khan. Có thể nói thật mình cũng vui vì giúp được, và rằng họ luôn có thể quay lại bất cứ lúc nào nếu cần tâm sự hoặc cần tập
11. Đừng cố làm "AI hữu ích" bằng mọi giá trong lúc user đang xuống tinh thần — đôi khi câu trả lời tốt nhất chỉ là 1-2 câu ngắn cho họ thấy có người hiểu, không cần giải pháp ngay`
}

// Keywords detect yêu cầu tạo lịch tập
const SCHEDULE_KEYWORDS = [
    'tạo lịch tập', 'lập lịch tập', 'lịch tập cho tôi', 'lịch tập cho tao',
    'lịch tập tuần', 'làm lịch tập', 'schedule', 'workout plan',
    'tạo cho tôi lịch', 'tạo cho tao lịch', 'lịch tập mới',
    'tạo lịch', 'lên lịch tập',
]

function isScheduleRequest(msg) {
    const lower = msg.toLowerCase()
    return SCHEDULE_KEYWORDS.some(k => lower.includes(k))
}

function WorkoutScheduleCard({ schedule }) {
    const colors = ['var(--accent)', '#60a5fa', '#a78bfa', '#34d399', '#f59e0b', '#f97316']
    return (
        <div style={{ width: '100%', marginTop: '4px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
                Lịch tập được tạo bởi AI
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {schedule.map((day, i) => (
                    <div key={i} style={{
                        background: 'var(--card)', border: '1px solid var(--border)',
                        borderLeft: `3px solid ${colors[i % colors.length]}`,
                        borderRadius: '10px', padding: '12px 14px',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text)' }}>{day.day}</div>
                            <div style={{
                                fontSize: '11px', fontWeight: 600, padding: '2px 8px',
                                borderRadius: '20px', background: `${colors[i % colors.length]}22`,
                                color: colors[i % colors.length], border: `1px solid ${colors[i % colors.length]}44`
                            }}>{day.group}</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {day.exercises?.map((ex, j) => (
                                <div key={j} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    fontSize: '13px', color: 'var(--text-secondary)',
                                    padding: '4px 0', borderBottom: j < day.exercises.length - 1 ? '1px solid var(--border)' : 'none'
                                }}>
                                    <span style={{ color: 'var(--text)' }}>• {ex.name}</span>
                                    <span style={{ fontSize: '12px' }}>{ex.sets} sets × {ex.reps}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

const QUICK_REPLIES = [
    'Tạo lịch tập cho tôi',
    'Gợi ý bữa ăn?',
    'Tiến độ của tôi',
    'Hôm nay mệt mỏi',
]

export default function AICoach() {
    const { user } = useAuth()
    const { getTodayTotal, dailyGoal } = useFood()
    const { tuoi, canNang, chieuCao, kinhNghiem, benhLy, mucTieu, soNgay } = useApp()
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [apiMessages, setApiMessages] = useState([])
    const [memory, setMemory] = useState(null)
    const [memoryLoaded, setMemoryLoaded] = useState(false)
    const [currentTopics, setCurrentTopics] = useState([])
    const chatEndRef = useRef(null)

    useEffect(() => {
        if (!user) return
        Promise.all([
            loadMemory(user.uid),
            loadChatHistory(user.uid),
        ]).then(([mem, history]) => {
            setMemory(mem)
            setMemoryLoaded(true)
            updateSessionMeta(user.uid)

            if (history.length > 0) {
                // Có lịch sử chat → load lại, thêm greeting mới ở cuối
                const name = user.displayName?.split(' ').pop() || 'bạn'
                const greeting = buildGreeting(name, mem)
                setMessages([...history, { role: 'ai', content: greeting }])
                // Lưu greeting mới vào history
                saveChatMessage(user.uid, { role: 'ai', content: greeting })
            } else {
                // Lần đầu → chỉ show greeting
                const name = user.displayName?.split(' ').pop() || 'bạn'
                const greeting = buildGreeting(name, mem)
                setMessages([{ role: 'ai', content: greeting }])
                saveChatMessage(user.uid, { role: 'ai', content: greeting })
            }
        })
    }, [user])

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSend = async (overrideInput) => {
        const msg = (overrideInput || input).trim()
        if (!msg || loading) return

        setMessages(prev => [...prev, { role: 'user', content: msg }])
        if (user) saveChatMessage(user.uid, { role: 'user', content: msg })
        setInput('')
        setLoading(true)

        const total = getTodayTotal()
        const todayData = {
            calories: total.calories,
            goalCalories: dailyGoal.calories,
            protein: total.protein,
            goalProtein: dailyGoal.protein,
        }

        // Nếu user muốn tạo lịch tập → gọi riêng với prompt chuyên biệt
        if (isScheduleRequest(msg)) {
            const bmi = (canNang && chieuCao)
                ? (parseFloat(canNang) / Math.pow(parseFloat(chieuCao) / 100, 2)).toFixed(1)
                : '?'
            const schedulePrompt = `Bạn là huấn luyện viên thể hình. Tạo lịch tập cho người dùng sau:
- Tuổi: ${tuoi || '?'}, Cân nặng: ${canNang || '?'}kg, Chiều cao: ${chieuCao || '?'}cm, BMI: ${bmi}
- Kinh nghiệm: ${kinhNghiem || '?'}
- Tình trạng sức khỏe: ${benhLy || 'Không có'}
- Mục tiêu: ${mucTieu || '?'}
- Số ngày tập: ${soNgay || '3 ngày'}

Trả lời bằng tiếng Việt. Đầu tiên viết 1-2 câu giới thiệu lịch tập tự nhiên (như bạn bè nói chuyện).
Sau đó thêm tag [SCHEDULE:JSON] với format:
[SCHEDULE:[{"day":"Thứ 2","group":"PUSH","exercises":[{"name":"Bench Press","sets":"4","reps":"8-10"}]}]]

Chỉ JSON thuần trong tag, không markdown, không giải thích thêm sau tag.`

            try {
                const data = await callGemini(GEMINI_KEY, {
                    contents: [{ role: 'user', parts: [{ text: schedulePrompt }] }],
                    generationConfig: { maxOutputTokens: 1200 }
                })
                let reply = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
                const scheduleMatch = reply.match(/\[SCHEDULE:(.*?)\]$/s)
                if (scheduleMatch) {
                    try {
                        const scheduleJson = JSON.parse(scheduleMatch[1].trim())
                        const textPart = reply.replace(/\[SCHEDULE:.*?\]$/s, '').trim()
                        setMessages(prev => [...prev, {
                            role: 'ai',
                            content: textPart || 'Đây là lịch tập mình tạo cho bạn! 💪',
                            schedule: scheduleJson
                        }])
                    } catch {
                        setMessages(prev => [...prev, { role: 'ai', content: reply }])
                    }
                } else {
                    setMessages(prev => [...prev, { role: 'ai', content: reply }])
                }
            } catch {
                setMessages(prev => [...prev, { role: 'ai', content: 'Lỗi kết nối, thử lại nhé!' }])
            }
            setLoading(false)
            return
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
                generationConfig: { maxOutputTokens: 800 }
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
                        lastEmotionalAt: new Date().toISOString(),
                        recentMoods: [
                            ...(prev?.emotionalMemory?.recentMoods || []).slice(-9),
                            { mood, context, timestamp: new Date().toISOString() }
                        ]
                    }
                }))
                reply = reply.replace(/\[EMOTION:.*?\]/s, '').trim()
            }

            const topicMatch = reply.match(/\[TOPIC:\s*(.+?)\]/s)
            if (topicMatch && user) {
                const topic = topicMatch[1].trim()
                const updatedTopics = [topic, ...currentTopics].slice(0, 3)
                setCurrentTopics(updatedTopics)
                updateSessionMeta(user.uid, updatedTopics)
                reply = reply.replace(/\[TOPIC:.*?\]/s, '').trim()
            }

            // Check nếu AI trả về lịch tập JSON
            const scheduleMatch = reply.match(/\[SCHEDULE:(.+?)\]/s)
            if (scheduleMatch) {
                try {
                    const scheduleJson = JSON.parse(scheduleMatch[1].trim())
                    const textPart = reply.replace(/\[SCHEDULE:.*?\]/s, '').trim()
                    setMessages(prev => [...prev, {
                        role: 'ai',
                        content: textPart || 'Đây là lịch tập mình tạo cho bạn! 💪',
                        schedule: scheduleJson
                    }])
                } catch {
                    setMessages(prev => [...prev, { role: 'ai', content: reply }])
                }
            } else {
                setMessages(prev => [...prev, { role: 'ai', content: reply }])
            }
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
                            maxWidth: msg.schedule ? '100%' : '80%',
                            padding: '10px 14px',
                            borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                            background: msg.role === 'user' ? 'var(--accent)' : 'var(--card2)',
                            color: msg.role === 'user' ? '#fff' : 'var(--text)',
                            fontSize: '13px', lineHeight: 1.6,
                            border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
                        }}>
                            <MessageContent text={msg.content} />
                            {msg.schedule && <WorkoutScheduleCard schedule={msg.schedule} />}
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
