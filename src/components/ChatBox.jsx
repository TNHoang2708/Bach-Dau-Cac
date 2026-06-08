import { useState, useRef, useEffect } from 'react'
import { Bot, Send, X, Minimize2, Maximize2, Sparkles, ChevronDown, Trash2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useFood } from '../context/FoodContext'

const GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY

// Typing animation dots
function TypingDots() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 0' }}>
      {[0, 1, 2].map(i => (
        <div
          key={i}
          style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: 'var(--accent)',
            animation: `chatDot 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

// Simple inline markdown parsing: Bold **, Italic *, Code `
function parseInline(text) {
  if (!text) return ''
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g
  const splitParts = text.split(regex)
  
  return splitParts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ fontWeight: '700', color: '#fff' }}>{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i} style={{ fontStyle: 'italic' }}>{part.slice(1, -1)}</em>
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} style={{
          background: 'rgba(255,255,255,0.12)',
          padding: '2px 5px',
          borderRadius: '4px',
          fontSize: '12px',
          fontFamily: 'monospace',
          color: '#00d4a0'
        }}>
          {part.slice(1, -1)}
        </code>
      )
    }
    return part
  })
}

// Format markdown text with lists, headers, paragraphs, etc.
function MessageContent({ text }) {
  if (!text) return null
  
  const lines = text.split('\n')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {lines.map((line, index) => {
        const trimmed = line.trim()
        
        // Headings
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={index} style={{ margin: '8px 0 4px', fontSize: '13.5px', fontWeight: '700', color: '#00d4a0' }}>
              {parseInline(trimmed.slice(4))}
            </h4>
          )
        }
        if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
          const headerText = trimmed.startsWith('## ') ? trimmed.slice(3) : trimmed.slice(2)
          return (
            <h3 key={index} style={{ margin: '12px 0 6px', fontSize: '14.5px', fontWeight: '700', color: '#00d4a0' }}>
              {parseInline(headerText)}
            </h3>
          )
        }
        
        // Bullet list
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
          return (
            <div key={index} style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', paddingLeft: '6px' }}>
              <span style={{ color: '#00d4a0', flexShrink: 0 }}>•</span>
              <span>{parseInline(trimmed.slice(2))}</span>
            </div>
          )
        }
        
        // Numbered list
        const numMatch = trimmed.match(/^(\d+)\.\s(.*)/)
        if (numMatch) {
          return (
            <div key={index} style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', paddingLeft: '6px' }}>
              <span style={{ color: '#00d4a0', fontWeight: '700', flexShrink: 0 }}>{numMatch[1]}.</span>
              <span>{parseInline(numMatch[2])}</span>
            </div>
          )
        }
        
        // Empty lines
        if (trimmed === '') {
          return <div key={index} style={{ height: '4px' }} />
        }
        
        // Normal paragraph text
        return (
          <div key={index} style={{ margin: 0, minHeight: '18px' }}>
            {parseInline(line)}
          </div>
        )
      })}
    </div>
  )
}

const QUICK_REPLIES = [
  '💪 Lịch tập hôm nay?',
  '🥗 Gợi ý bữa ăn lành mạnh',
  '⚡ Cách tăng cơ nhanh?',
  '🔥 Đốt mỡ hiệu quả?',
  '💧 Uống bao nhiêu nước/ngày?',
]

function ChatBox() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content: '👋 Xin chào! Mình là **AI Coach** thể hình & dinh dưỡng.\\n\\nBạn muốn hỏi gì hôm nay? 💪',
      time: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [unread, setUnread] = useState(0)
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const inputRef = useRef(null)

  // Fetch contexts for personalization
  const { tuoi, canNang, chieuCao, mucTieu, soNgay, ketQua } = useApp()
  const { dailyGoal, getTodayTotal } = useFood()

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom()
      setUnread(0)
    }
  }, [messages, isOpen, isMinimized])

  // Handle scroll visibility
  const handleScroll = () => {
    const container = messagesContainerRef.current
    if (!container) return
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100
    setShowScrollBtn(!isNearBottom)
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  }

  const handleClearHistory = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa lịch sử cuộc trò chuyện này không?')) {
      setMessages([
        {
          role: 'ai',
          content: '👋 Đã xóa lịch sử trò chuyện. Mình là **AI Coach** thể hình & dinh dưỡng.\\n\\nBạn muốn hỏi gì tiếp theo? 💪',
          time: new Date(),
        },
      ])
      setInput('')
    }
  }

  const sendMessage = async (overrideMsg) => {
    const msg = overrideMsg || input.trim()
    if (!msg || loading) return

    const userMsg = { role: 'user', content: msg, time: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    // Calculate user profile details
    const heightM = chieuCao ? parseFloat(chieuCao) / 100 : null
    const weightKg = canNang ? parseFloat(canNang) : null
    const bmi = (weightKg && heightM) ? (weightKg / (heightM * heightM)).toFixed(1) : null
    
    let bmiCategory = ''
    if (bmi) {
      const b = parseFloat(bmi)
      if (b < 18.5) bmiCategory = 'Thiếu cân ⚠️'
      else if (b < 23) bmiCategory = 'Bình thường ✅'
      else if (b < 25) bmiCategory = 'Tiền béo phì (Thừa cân) ⚠️'
      else if (b < 30) bmiCategory = 'Béo phì độ 1 🚨'
      else bmiCategory = 'Béo phì độ 2 🚨'
    }

    const todayNutri = getTodayTotal ? getTodayTotal() : { calories: 0, protein: 0, carbs: 0, fat: 0 }

    const systemPrompt = `Bạn là AI Coach - Huấn luyện viên thể hình & dinh dưỡng thông minh, thân thiện và tận tâm.
Hãy trò chuyện và hướng dẫn người dùng dựa trên thông tin sức khỏe cá nhân của họ bên dưới.

THÔNG TIN SỨC KHỎE NGƯỜI DÙNG:
- Tuổi: ${tuoi || 'Chưa nhập'}
- Chiều cao: ${chieuCao || 'Chưa nhập'} cm
- Cân nặng: ${canNang || 'Chưa nhập'} kg
- Chỉ số BMI: ${bmi ? `${bmi} (${bmiCategory})` : 'Chưa tính (khuyên người dùng nhập chiều cao, cân nặng ở mục BMI)'}
- Mục tiêu: ${mucTieu || 'Chưa chọn'}
- Lịch tập mong muốn: ${soNgay || 'Chưa chọn'}
- Lịch tập hiện tại đã tạo:
${ketQua ? ketQua.slice(0, 500) : 'Chưa có.'}

DINH DƯỠNG HÔM NAY (Đã nạp / Mục tiêu ngày):
- Calo: ${todayNutri.calories || 0} kcal / ${dailyGoal?.calories || 2500} kcal
- Protein: ${todayNutri.protein || 0}g / ${dailyGoal?.protein || 150}g
- Carbs: ${todayNutri.carbs || 0}g / ${dailyGoal?.carbs || 300}g
- Fat: ${todayNutri.fat || 0}g / ${dailyGoal?.fat || 80}g

HƯỚNG DẪN TRẢ LỜI:
1. Trả lời bằng tiếng Việt, thân thiện, ngắn gọn, súc tích và có cấu trúc rõ ràng. Dùng emoji phù hợp.
2. Tối đa 250 từ mỗi câu trả lời.
3. Cá nhân hóa câu trả lời dựa trên chỉ số sức khỏe & dinh dưỡng của người dùng ở trên. Hãy đưa ra các giải pháp cụ thể giúp họ đạt được mục tiêu tập luyện "${mucTieu}".
4. Sử dụng định dạng markdown: Tiêu đề phụ (##, ###), danh sách đầu dòng (-, *), in đậm (**) hoặc in nghiêng (*) để nội dung hiển thị thật rõ ràng, chuyên nghiệp.`

    // Construct conversation history for Gemini API
    const updatedHistory = [...messages, userMsg]
    const contents = []
    let lastRole = null

    updatedHistory.forEach((m, idx) => {
      // Skip the welcome message to ensure the payload starts with a 'user' message
      if (idx === 0 && m.role === 'ai') return

      const apiRole = m.role === 'ai' ? 'model' : 'user'
      if (apiRole === lastRole) {
        contents[contents.length - 1].parts[0].text += '\n\n' + m.content
      } else {
        contents.push({
          role: apiRole,
          parts: [{ text: m.content }]
        })
        lastRole = apiRole
      }
    })

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            systemInstruction: {
              parts: [{ text: systemPrompt }]
            },
            generationConfig: { maxOutputTokens: 600, temperature: 0.7 },
          }),
        }
      )
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error?.message || `Lỗi HTTP! Trạng thái: ${res.status}`)
      }
      
      if (data.error) {
        throw new Error(data.error.message || 'Lỗi API không xác định')
      }

      const reply =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        'Xin lỗi, mình chưa hiểu câu hỏi này. Bạn có thể hỏi lại không? 🙏'

      setMessages(prev => [...prev, { role: 'ai', content: reply, time: new Date() }])
      if (!isOpen) setUnread(prev => prev + 1)
    } catch (error) {
      console.error("Gemini Chat Error:", error)
      setMessages(prev => [
        ...prev,
        { role: 'ai', content: `❌ Lỗi: ${error.message || 'Lỗi kết nối. Vui lòng thử lại sau nhé!'}`, time: new Date() },
      ])
    }
    setLoading(false)
  }

  const handleOpen = () => {
    setIsOpen(true)
    setIsMinimized(false)
    setUnread(0)
    setTimeout(() => {
      inputRef.current?.focus()
      scrollToBottom()
    }, 300)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* Inject keyframe animations */}
      <style>{`
        @keyframes chatDot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes chatPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(0,212,160,0.4); }
          50% { box-shadow: 0 0 0 12px rgba(0,212,160,0); }
        }
        @keyframes chatBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .chat-msg-ai {
          animation: chatSlideUp 0.25s ease forwards;
        }
        .chat-msg-user {
          animation: chatSlideUp 0.2s ease forwards;
        }
        .chat-quick-btn:hover {
          background: rgba(0,212,160,0.15) !important;
          border-color: var(--accent) !important;
          color: var(--accent) !important;
          transform: translateY(-1px);
        }
        .chat-send-btn:hover:not(:disabled) {
          background: #00b888 !important;
          transform: scale(1.05);
        }
        .chat-send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .chat-input:focus {
          border-color: var(--accent) !important;
          box-shadow: 0 0 0 3px rgba(0,212,160,0.12);
        }
        .chat-fab:hover {
          transform: scale(1.08) !important;
        }
        .chatbox-container::-webkit-scrollbar {
          width: 4px;
        }
        .chatbox-container::-webkit-scrollbar-track {
          background: transparent;
        }
        .chatbox-container::-webkit-scrollbar-thumb {
          background: rgba(0,212,160,0.3);
          border-radius: 4px;
        }
      `}</style>

      {/* FAB Button */}
      {!isOpen && (
        <button
          className="chat-fab"
          onClick={handleOpen}
          style={{
            position: 'fixed',
            bottom: '28px',
            right: '28px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent), #2563eb)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(0,212,160,0.4)',
            animation: 'chatPulse 2.5s ease-in-out infinite',
            transition: 'transform 0.2s ease',
            zIndex: 9999,
            padding: 0,
            margin: 0,
          }}
          aria-label="Mở AI Chat"
        >
          <Bot size={28} color="#000" />
          {unread > 0 && (
            <div style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              background: '#ef4444',
              color: '#fff',
              fontSize: '11px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #080808',
            }}>
              {unread}
            </div>
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '28px',
            right: '28px',
            width: '380px',
            maxWidth: 'calc(100vw - 32px)',
            height: isMinimized ? 'auto' : '560px',
            maxHeight: 'calc(100vh - 56px)',
            background: '#111111',
            borderRadius: '20px',
            border: '1px solid rgba(0,212,160,0.2)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,212,160,0.08)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 9999,
            animation: 'chatSlideUp 0.3s cubic-bezier(0.16,1,0.3,1) forwards',
          }}
        >
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, var(--accent) 0%, #2563eb 100%)',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flexShrink: 0,
          }}>
            {/* Avatar */}
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Bot size={20} color="#000" />
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '700', fontSize: '14px', color: '#000', display: 'flex', alignItems: 'center', gap: '6px' }}>
                AI Coach
                <Sparkles size={12} color="#000" style={{ opacity: 0.7 }} />
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#000', opacity: 0.8 }} />
                Trực tuyến · Powered by Gemini
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={handleClearHistory}
                title="Xóa cuộc trò chuyện"
                style={{
                  width: '30px', height: '30px', borderRadius: '8px',
                  background: 'rgba(0,0,0,0.15)', border: 'none',
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', transition: 'background 0.2s', padding: 0, margin: 0,
                }}
              >
                <Trash2 size={14} color="#000" />
              </button>
              <button
                onClick={() => setIsMinimized(p => !p)}
                style={{
                  width: '30px', height: '30px', borderRadius: '8px',
                  background: 'rgba(0,0,0,0.15)', border: 'none',
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', transition: 'background 0.2s', padding: 0, margin: 0,
                }}
              >
                {isMinimized ? <Maximize2 size={14} color="#000" /> : <Minimize2 size={14} color="#000" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  width: '30px', height: '30px', borderRadius: '8px',
                  background: 'rgba(0,0,0,0.15)', border: 'none',
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', transition: 'background 0.2s', padding: 0, margin: 0,
                }}
              >
                <X size={14} color="#000" />
              </button>
            </div>
          </div>

          {/* Body (hidden when minimized) */}
          {!isMinimized && (
            <>
              {/* Messages */}
              <div
                ref={messagesContainerRef}
                className="chatbox-container"
                onScroll={handleScroll}
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={msg.role === 'ai' ? 'chat-msg-ai' : 'chat-msg-user'}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    }}
                  >
                    {/* Avatar for AI */}
                    {msg.role === 'ai' && (
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px' }}>
                        <div style={{
                          width: '26px', height: '26px', borderRadius: '50%',
                          background: 'linear-gradient(135deg, var(--accent), #2563eb)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <Bot size={13} color="#000" />
                        </div>
                        <div style={{
                          maxWidth: '260px',
                          padding: '10px 14px',
                          borderRadius: '4px 16px 16px 16px',
                          background: '#1a1a1a',
                          border: '1px solid #2a2a2a',
                          color: '#fff',
                          fontSize: '13.5px',
                          lineHeight: '1.65',
                        }}>
                          <MessageContent text={msg.content} />
                        </div>
                      </div>
                    )}

                    {/* User bubble */}
                    {msg.role === 'user' && (
                      <div style={{
                        maxWidth: '260px',
                        padding: '10px 14px',
                        borderRadius: '16px 4px 16px 16px',
                        background: 'linear-gradient(135deg, var(--accent), #2563eb)',
                        color: '#000',
                        fontSize: '13.5px',
                        lineHeight: '1.65',
                        fontWeight: '500',
                      }}>
                        {msg.content}
                      </div>
                    )}

                    {/* Timestamp */}
                    <div style={{
                      fontSize: '10px',
                      color: '#555',
                      marginTop: '3px',
                      marginLeft: msg.role === 'ai' ? '32px' : '0',
                    }}>
                      {formatTime(msg.time)}
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {loading && (
                  <div className="chat-msg-ai" style={{ display: 'flex', alignItems: 'flex-end', gap: '6px' }}>
                    <div style={{
                      width: '26px', height: '26px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--accent), #2563eb)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Bot size={13} color="#000" />
                    </div>
                    <div style={{
                      padding: '10px 16px',
                      borderRadius: '4px 16px 16px 16px',
                      background: '#1a1a1a',
                      border: '1px solid #2a2a2a',
                    }}>
                      <TypingDots />
                    </div>
                  </div>
                )}

                {/* Scroll anchor */}
                <div ref={messagesEndRef} />
              </div>

              {/* Scroll to bottom button */}
              {showScrollBtn && (
                <button
                  onClick={scrollToBottom}
                  style={{
                    position: 'absolute',
                    bottom: '140px',
                    right: '16px',
                    width: '32px', height: '32px',
                    borderRadius: '50%',
                    background: '#1a1a1a',
                    border: '1px solid #2a2a2a',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                    padding: 0, margin: 0,
                    zIndex: 1,
                    transition: 'all 0.2s',
                  }}
                >
                  <ChevronDown size={16} color="#aaa" />
                </button>
              )}

              {/* Quick replies */}
              <div style={{
                padding: '8px 12px 4px',
                borderTop: '1px solid #1e1e1e',
                display: 'flex',
                gap: '6px',
                overflowX: 'auto',
                flexShrink: 0,
                scrollbarWidth: 'none',
              }}>
                {QUICK_REPLIES.map(q => (
                  <button
                    key={q}
                    className="chat-quick-btn"
                    onClick={() => sendMessage(q)}
                    disabled={loading}
                    style={{
                      whiteSpace: 'nowrap',
                      padding: '5px 10px',
                      fontSize: '11.5px',
                      background: 'transparent',
                      border: '1px solid #2a2a2a',
                      color: '#aaa',
                      borderRadius: '20px',
                      cursor: 'pointer',
                      transition: 'all 0.18s ease',
                      flexShrink: 0,
                      width: 'auto',
                      margin: 0,
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Input area */}
              <div style={{
                padding: '10px 12px 14px',
                display: 'flex',
                gap: '8px',
                alignItems: 'flex-end',
                flexShrink: 0,
                background: '#111',
              }}>
                <textarea
                  ref={inputRef}
                  className="chat-input"
                  placeholder="Hỏi AI Coach bất cứ điều gì..."
                  value={input}
                  onChange={e => {
                    setInput(e.target.value)
                    // Auto resize
                    e.target.style.height = 'auto'
                    e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px'
                  }}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    fontSize: '13.5px',
                    border: '1px solid #2a2a2a',
                    borderRadius: '14px',
                    background: '#1a1a1a',
                    color: '#fff',
                    outline: 'none',
                    resize: 'none',
                    lineHeight: '1.5',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    fontFamily: 'Inter, sans-serif',
                    maxHeight: '100px',
                    overflowY: 'auto',
                    width: 'auto',
                  }}
                />
                <button
                  className="chat-send-btn"
                  onClick={() => sendMessage()}
                  disabled={loading || !input.trim()}
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, var(--accent), #2563eb)',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    padding: 0,
                    margin: 0,
                    transition: 'all 0.18s ease',
                  }}
                >
                  <Send size={17} color="#000" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}

export default ChatBox
