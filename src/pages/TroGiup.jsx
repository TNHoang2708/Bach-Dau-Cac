import { useState } from 'react'
import {
    HelpCircle, ChevronDown, Dumbbell, Salad, Scale, BookOpen,
    MessageSquare, Mail, ExternalLink, Sparkles, Search, Keyboard,
    Bot, Target, BarChart3, Clock, Shield, Zap
} from 'lucide-react'

const faqData = [
    {
        cau: 'Làm thế nào để tạo lịch tập gym?',
        dap: 'Vào trang "Lịch tập", điền thông tin cá nhân (tuổi, cân nặng, chiều cao, mục tiêu...) rồi nhấn "Tạo lịch tập". AI sẽ tự động tạo lịch tập phù hợp với bạn.',
        icon: <Dumbbell size={16} />
    },
    {
        cau: 'Tính năng Dinh dưỡng hoạt động như thế nào?',
        dap: 'Trang "Dinh dưỡng" cho phép bạn chụp hoặc upload ảnh món ăn, AI sẽ phân tích thành phần dinh dưỡng (calo, protein, carb, chất béo...) và đưa ra nhận xét.',
        icon: <Salad size={16} />
    },
    {
        cau: 'Chỉ số BMI là gì và cách tính?',
        dap: 'BMI (Body Mass Index) là chỉ số khối cơ thể, được tính bằng cân nặng (kg) chia bình phương chiều cao (m). Vào trang "BMI", nhập cân nặng và chiều cao để xem kết quả và lời khuyên.',
        icon: <Scale size={16} />
    },
    {
        cau: 'Nhật ký tập luyện dùng để làm gì?',
        dap: 'Nhật ký giúp bạn ghi lại quá trình tập luyện hàng ngày, theo dõi tiến độ và duy trì thói quen tập gym đều đặn.',
        icon: <BookOpen size={16} />
    },
    {
        cau: 'AI Chatbot có thể giúp gì?',
        dap: 'Chatbot AI (biểu tượng bong bóng chat góc phải) có thể trả lời mọi câu hỏi về tập gym, dinh dưỡng, sức khỏe. Bạn có thể hỏi bất cứ điều gì liên quan!',
        icon: <Bot size={16} />
    },
    {
        cau: 'Dashboard hiển thị những gì?',
        dap: 'Dashboard tổng hợp thống kê tập luyện, tiến độ mục tiêu, biểu đồ calo, BMI theo thời gian và nhiều số liệu khác để bạn theo dõi hiệu quả.',
        icon: <BarChart3 size={16} />
    },
    {
        cau: 'Dữ liệu của tôi có an toàn không?',
        dap: 'Có! Dữ liệu được lưu trữ trên Firebase với bảo mật cấp cao. Chỉ bạn mới có quyền truy cập thông tin cá nhân của mình.',
        icon: <Shield size={16} />
    },
    {
        cau: 'Ứng dụng có miễn phí không?',
        dap: 'Gym Planner AI cung cấp gói Free với đầy đủ tính năng cơ bản. Bạn có thể nâng cấp lên gói Premium để trải nghiệm tính năng nâng cao.',
        icon: <Zap size={16} />
    },
    {
        cau: 'Làm sao để gửi phản hồi hoặc báo lỗi?',
        dap: 'Vào trang "Feedback" trong menu bên trái, bạn có thể gửi đánh giá, báo lỗi hoặc góp ý tính năng mới. Đội ngũ sẽ xem xét sớm nhất!',
        icon: <MessageSquare size={16} />
    },
    {
        cau: 'Làm sao để chỉnh sửa hồ sơ cá nhân?',
        dap: 'Bấm vào avatar ở góc dưới sidebar, chọn "Hồ sơ" hoặc vào trang Profile từ menu. Tại đây bạn có thể cập nhật tên, ảnh đại diện và thông tin sức khỏe.',
        icon: <Target size={16} />
    },
]

const features = [
    {
        icon: <Target size={24} />,
        title: 'Lịch tập cá nhân hóa',
        desc: 'AI tạo lịch tập riêng dựa trên thể trạng, mục tiêu và kinh nghiệm của bạn.',
    },
    {
        icon: <Salad size={24} />,
        title: 'Phân tích dinh dưỡng',
        desc: 'Upload ảnh món ăn để AI phân tích chi tiết thành phần dinh dưỡng.',
    },
    {
        icon: <BarChart3 size={24} />,
        title: 'Theo dõi BMI',
        desc: 'Tính toán và theo dõi chỉ số BMI, nhận lời khuyên sức khỏe phù hợp.',
    },
    {
        icon: <Clock size={24} />,
        title: 'Nhật ký tập luyện',
        desc: 'Ghi chép và xem lại lịch sử tập luyện, theo dõi tiến bộ theo thời gian.',
    },
    {
        icon: <Bot size={24} />,
        title: 'AI Chatbot thông minh',
        desc: 'Hỏi đáp trực tiếp với AI về mọi vấn đề tập gym và dinh dưỡng.',
    },
    {
        icon: <Sparkles size={24} />,
        title: 'Giao diện hiện đại',
        desc: 'Thiết kế tối giản, dễ sử dụng trên mọi thiết bị từ desktop đến mobile.',
    },
]

const huongDan = [
    {
        step: '1',
        title: 'Đăng nhập tài khoản',
        desc: 'Sử dụng email/Google để đăng nhập. Tài khoản mới sẽ được tạo tự động.',
    },
    {
        step: '2',
        title: 'Điền thông tin cá nhân',
        desc: 'Nhập tuổi, cân nặng, chiều cao, mục tiêu tập luyện để AI hiểu bạn hơn.',
    },
    {
        step: '3',
        title: 'Tạo lịch tập AI',
        desc: 'Nhấn "Tạo lịch tập" và để AI lên kế hoạch tập luyện phù hợp nhất cho bạn.',
    },
    {
        step: '4',
        title: 'Theo dõi tiến độ',
        desc: 'Sử dụng Nhật ký, Dashboard và BMI để theo dõi tiến bộ hàng ngày.',
    },
]

function TroGiup() {
    const [openFaq, setOpenFaq] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')

    const filteredFaq = faqData.filter(
        f => f.cau.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.dap.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div>
            {/* Hero */}
            <div className="card" style={{
                background: 'linear-gradient(135deg, rgba(0,212,160,0.12) 0%, var(--card) 60%)',
                border: '1px solid rgba(0,212,160,0.2)',
                textAlign: 'center',
                padding: '3rem 2rem',
            }}>
                <div style={{
                    width: '64px', height: '64px', borderRadius: '20px',
                    background: 'var(--accent-dim)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 1.25rem',
                }}>
                    <HelpCircle size={32} style={{ color: 'var(--accent)' }} />
                </div>
                <h1 style={{
                    fontSize: '28px', fontWeight: '800', marginBottom: '8px',
                    background: 'linear-gradient(135deg, #fff 0%, var(--accent) 100%)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                    Trung tâm trợ giúp
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '480px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
                    Tìm câu trả lời cho mọi thắc mắc về Gym Planner AI. Bạn cần hỗ trợ gì?
                </p>

                {/* Search */}
                <div style={{
                    position: 'relative', maxWidth: '440px', margin: '0 auto',
                }}>
                    <Search size={18} style={{
                        position: 'absolute', left: '14px', top: '50%',
                        transform: 'translateY(-50%)', color: 'var(--text-secondary)',
                    }} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm câu hỏi..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{
                            paddingLeft: '42px', paddingRight: '14px',
                            background: 'var(--card2)', border: '1px solid var(--border)',
                            borderRadius: '12px', height: '48px', width: '100%',
                            fontSize: '14px',
                        }}
                    />
                </div>
            </div>

            {/* Hướng dẫn bắt đầu */}
            <div className="card">
                <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Dumbbell size={16} /> Bắt đầu sử dụng
                </div>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '12px',
                }}>
                    {huongDan.map((h, i) => (
                        <div key={i} style={{
                            background: 'var(--card2)', border: '1px solid var(--border)',
                            borderRadius: '14px', padding: '1.25rem',
                            position: 'relative', overflow: 'hidden',
                        }}>
                            <div style={{
                                position: 'absolute', top: '12px', right: '14px',
                                fontSize: '48px', fontWeight: '900',
                                color: 'rgba(0,212,160,0.07)', lineHeight: 1,
                            }}>{h.step}</div>
                            <div style={{
                                width: '36px', height: '36px', borderRadius: '10px',
                                background: 'var(--accent)', color: '#000',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '16px', fontWeight: '800', marginBottom: '12px',
                            }}>
                                {h.step}
                            </div>
                            <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '6px' }}>{h.title}</div>
                            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{h.desc}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Feature overview */}
            <div className="card">
                <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={16} /> Tính năng chính
                </div>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: '12px',
                }}>
                    {features.map((f, i) => (
                        <div key={i} style={{
                            background: 'var(--card2)', border: '1px solid var(--border)',
                            borderRadius: '14px', padding: '1.25rem',
                            transition: 'all 0.25s ease',
                            cursor: 'default',
                        }}
                            onMouseEnter={e => {
                                e.currentTarget.style.borderColor = 'var(--accent)'
                                e.currentTarget.style.transform = 'translateY(-2px)'
                                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,212,160,0.08)'
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.borderColor = 'var(--border)'
                                e.currentTarget.style.transform = 'translateY(0)'
                                e.currentTarget.style.boxShadow = 'none'
                            }}
                        >
                            <div style={{
                                width: '44px', height: '44px', borderRadius: '12px',
                                background: 'var(--accent-dim)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                color: 'var(--accent)', marginBottom: '12px',
                            }}>
                                {f.icon}
                            </div>
                            <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '6px' }}>{f.title}</div>
                            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* FAQ */}
            <div className="card">
                <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <HelpCircle size={16} /> Câu hỏi thường gặp ({filteredFaq.length})
                </div>

                {filteredFaq.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-secondary)' }}>
                        <Search size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                        <p style={{ fontSize: '14px' }}>Không tìm thấy kết quả cho "{searchTerm}"</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {filteredFaq.map((faq, idx) => {
                            const isOpen = openFaq === idx
                            return (
                                <div key={idx} style={{
                                    background: isOpen ? 'rgba(0,212,160,0.05)' : 'var(--card2)',
                                    border: `1px solid ${isOpen ? 'rgba(0,212,160,0.25)' : 'var(--border)'}`,
                                    borderRadius: '12px', overflow: 'hidden',
                                    transition: 'all 0.2s ease',
                                }}>
                                    <div
                                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '12px',
                                            padding: '16px', cursor: 'pointer',
                                            transition: 'background 0.15s',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <span style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            width: '32px', height: '32px', borderRadius: '8px',
                                            background: isOpen ? 'var(--accent-dim)' : 'rgba(255,255,255,0.05)',
                                            color: isOpen ? 'var(--accent)' : 'var(--text-secondary)',
                                            flexShrink: 0, transition: 'all 0.2s',
                                        }}>
                                            {faq.icon}
                                        </span>
                                        <span style={{
                                            flex: 1, fontSize: '14px', fontWeight: '600',
                                            color: isOpen ? 'var(--text)' : 'var(--text-secondary)',
                                            transition: 'color 0.2s',
                                        }}>
                                            {faq.cau}
                                        </span>
                                        <ChevronDown size={18} style={{
                                            color: 'var(--text-secondary)', flexShrink: 0,
                                            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                            transition: 'transform 0.25s ease',
                                        }} />
                                    </div>
                                    <div style={{
                                        maxHeight: isOpen ? '200px' : '0',
                                        opacity: isOpen ? 1 : 0,
                                        overflow: 'hidden',
                                        transition: 'max-height 0.3s ease, opacity 0.25s ease',
                                    }}>
                                        <div style={{
                                            padding: '0 16px 16px 60px',
                                            fontSize: '14px', color: 'var(--text-secondary)',
                                            lineHeight: 1.7,
                                        }}>
                                            {faq.dap}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Phím tắt */}
            <div className="card">
                <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Keyboard size={16} /> Phím tắt hữu ích
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {[
                        { keys: ['Ctrl', '/'], desc: 'Mở chatbot AI' },
                        { keys: ['Ctrl', 'K'], desc: 'Tìm kiếm nhanh' },
                        { keys: ['Esc'], desc: 'Đóng popup / chatbot' },
                    ].map((s, i) => (
                        <div key={i} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '12px 14px', borderRadius: '10px',
                            background: 'var(--card2)', border: '1px solid var(--border)',
                        }}>
                            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{s.desc}</span>
                            <div style={{ display: 'flex', gap: '6px' }}>
                                {s.keys.map((k, j) => (
                                    <kbd key={j} style={{
                                        padding: '4px 10px', borderRadius: '6px',
                                        background: 'rgba(255,255,255,0.08)',
                                        border: '1px solid var(--border)',
                                        fontSize: '12px', fontWeight: '600',
                                        color: 'var(--text)', fontFamily: 'inherit',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
                                    }}>
                                        {k}
                                    </kbd>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Liên hệ */}
            <div className="card" style={{
                background: 'linear-gradient(135deg, var(--card) 0%, rgba(0,212,160,0.06) 100%)',
                textAlign: 'center', padding: '2.5rem 2rem',
            }}>
                <Mail size={28} style={{ color: 'var(--accent)', margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>
                    Vẫn cần hỗ trợ?
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                    Liên hệ đội ngũ hỗ trợ qua email hoặc gửi feedback trực tiếp.
                </p>
                <div style={{
                    display: 'flex', gap: '12px', justifyContent: 'center',
                    flexWrap: 'wrap',
                }}>
                    <a href="mailto:support@gymplannerai.com" style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        padding: '12px 24px', borderRadius: '12px',
                        background: 'var(--accent)', color: '#000',
                        fontWeight: '700', fontSize: '14px',
                        textDecoration: 'none', transition: 'opacity 0.2s',
                    }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                        <Mail size={16} /> Gửi email
                    </a>
                    <a href="/feedback" style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        padding: '12px 24px', borderRadius: '12px',
                        background: 'var(--card2)', color: 'var(--text)',
                        fontWeight: '600', fontSize: '14px',
                        textDecoration: 'none', border: '1px solid var(--border)',
                        transition: 'all 0.2s',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text)' }}
                    >
                        <ExternalLink size={16} /> Gửi Feedback
                    </a>
                </div>
            </div>
        </div>
    )
}

export default TroGiup
