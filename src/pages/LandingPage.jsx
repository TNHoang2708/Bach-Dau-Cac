import { useState } from 'react'
import { Dumbbell, Salad, Scale, BookOpen, Zap, ChevronRight, ChevronLeft, Star } from 'lucide-react'

const slides = [
    {
        bg: 'https://i.pinimg.com/1200x/64/fc/74/64fc747a806f83fe857d46b082900ed0.jpg',
        content: 'hero'
    },
    {
        bg: 'https://png.pngtree.com/thumb_back/fh260/background/20220405/pngtree-muscular-bodybuilder-trains-to-perfect-physique-in-gym-photo-image_45119002.jpg',
        content: 'features'
    },
    {
        bg: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1600&q=80',
        content: 'cta'
    }
]

function LandingPage({ onGetStarted }) {
    const [current, setCurrent] = useState(0)

    const prev = () => setCurrent(c => (c - 1 + slides.length) % slides.length)
    const next = () => setCurrent(c => (c + 1) % slides.length)

    const features = [
        { icon: <Dumbbell size={32} />, title: 'Lịch tập AI', desc: 'AI tạo lịch tập cá nhân hóa theo thể trạng và mục tiêu của bạn' },
        { icon: <Salad size={32} />, title: 'Phân tích dinh dưỡng', desc: 'Chụp ảnh bữa ăn, AI phân tích calo và dinh dưỡng ngay lập tức' },
        { icon: <Scale size={32} />, title: 'Tính chỉ số BMI', desc: 'Tính BMI, cân nặng lý tưởng và lượng calo cần thiết mỗi ngày' },
        { icon: <BookOpen size={32} />, title: 'Nhật ký tập luyện', desc: 'Ghi lại và theo dõi từng buổi tập, lưu trữ trên cloud an toàn' },
    ]

    const arrowBtn = {
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '48px',
        height: '48px',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 10,
        color: '#fff',
        backdropFilter: 'blur(8px)',
        transition: 'all 0.3s ease',
        padding: 0,
    }

    const primaryBtn = {
        width: 'auto',
        padding: '14px 36px',
        fontSize: '15px',
        fontWeight: '800',
        borderRadius: '8px',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        background: '#00d4a0',
        color: '#000',
        border: 'none',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, background 0.2s ease',
    }

    return (
        <div style={{ width: '100%', height: '100vh', position: 'relative', overflow: 'hidden', fontFamily: 'Inter, sans-serif', color: '#fff', background: '#080808' }}>

            {/* NAVBAR */}
            <nav style={{
                position: 'absolute', top: 0, left: 0, right: 0,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '1.25rem 4rem',
                background: 'transparent',
                zIndex: 100
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Dumbbell size={24} color='#00d4a0' />
                    <span style={{ fontWeight: '800', fontSize: '20px', letterSpacing: '-0.5px' }}>GYM PLANNER AI</span>
                </div>
                <button onClick={onGetStarted} style={{
                    width: 'auto', padding: '10px 24px', fontSize: '14px',
                    fontWeight: '700', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.1)', color: '#fff',
                    border: '1px solid rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)',
                    display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', transition: 'all 0.2s'
                }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = '#fff';
                        e.currentTarget.style.color = '#000';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.color = '#fff';
                    }}>
                    Đăng nhập <ChevronRight size={15} />
                </button>
            </nav>

            {/* SLIDES CONTAINER */}
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>

                {/* Background images layer */}
                {slides.map((slide, i) => (
                    <div key={i} style={{
                        position: 'absolute', inset: 0,
                        opacity: current === i ? 1 : 0,
                        transition: 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                        pointerEvents: current === i ? 'auto' : 'none'
                    }}>
                        <img src={slide.bg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.2)' }} />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(8,8,8,0.95) 30%, rgba(8,8,8,0.4) 100%)' }} />
                    </div>
                ))}

                {/* SLIDE 1 - HERO */}
                <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center',
                    padding: '0 4rem',
                    opacity: current === 0 ? 1 : 0,
                    transform: current === 0 ? 'translateX(0)' : 'translateX(-40px)',
                    transition: 'opacity 0.6s ease, transform 0.6s ease',
                    pointerEvents: current === 0 ? 'auto' : 'none'
                }}>
                    <div style={{ maxWidth: '640px' }}>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            background: 'rgba(0,212,160,0.12)', border: '1px solid rgba(0,212,160,0.3)',
                            borderRadius: '4px', padding: '6px 14px',
                            fontSize: '12px', color: '#00d4a0', fontWeight: '700',
                            letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.5rem'
                        }}>
                            <Zap size={12} fill="#00d4a0" /> Powered by Gemini AI
                        </div>
                        <h1 style={{
                            fontSize: 'clamp(40px, 5vw, 72px)', fontWeight: '900',
                            lineHeight: 1.05, letterSpacing: '-2px',
                            textTransform: 'uppercase', marginBottom: '1.5rem'
                        }}>
                            SHAPE YOUR<br /><span style={{ color: '#00d4a0' }}>BODY</span> WITH AI
                        </h1>
                        <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: '2.5rem', maxWidth: '460px' }}>
                            Lịch tập cá nhân hóa, phân tích dinh dưỡng thông minh — hoàn toàn miễn phí.
                        </p>
                        <button onClick={onGetStarted} style={primaryBtn}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                            <Zap size={16} fill="#000" /> Bắt đầu miễn phí
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginTop: '2rem' }}>
                            {[...Array(5)].map((_, i) => <Star key={i} size={13} fill='#fbbf24' color='#fbbf24' />)}
                            <span>Được tin dùng bởi hàng ngàn người</span>
                        </div>
                    </div>
                    {/* Stats */}
                    <div style={{ position: 'absolute', right: '4rem', bottom: '4rem', display: 'flex', gap: '3.5rem' }}>
                        {[{ number: '10K+', label: 'Người dùng' }, { number: '50K+', label: 'Buổi tập' }, { number: '99%', label: 'Hài lòng' }].map((s, i) => (
                            <div key={i} style={{ textAlign: 'left' }}>
                                <div style={{ fontSize: '32px', fontWeight: '900', color: '#00d4a0', lineHeight: '1' }}>{s.number}</div>
                                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '6px' }} disable-decorator="true">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* SLIDE 2 - FEATURES */}
                <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0 4rem',
                    opacity: current === 1 ? 1 : 0,
                    transform: current === 1 ? 'translateX(0)' : current < 1 ? 'translateX(40px)' : 'translateX(-40px)',
                    transition: 'opacity 0.6s ease, transform 0.6s ease',
                    pointerEvents: current === 1 ? 'auto' : 'none'
                }}>
                    <div style={{ width: '100%', maxWidth: '1000px' }}>
                        <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
                            <p style={{ color: '#00d4a0', fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>Tính năng</p>
                            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: '900', letterSpacing: '-1.5px', textTransform: 'uppercase' }}>
                                MỌI THỨ ĐỂ <span style={{ color: '#00d4a0' }}>BỨT PHÁ</span>
                            </h2>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                            {features.map((f, i) => (
                                <div key={i} style={{
                                    background: 'rgba(255,255,255,0.02)', padding: '2.5rem 2rem',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    backdropFilter: 'blur(8px)',
                                    transition: 'all 0.2s ease',
                                    cursor: 'default'
                                }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.background = 'rgba(0,212,160,0.04)';
                                        e.currentTarget.style.borderColor = 'rgba(0,212,160,0.3)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                                    }}
                                >
                                    <div style={{ color: '#00d4a0', marginBottom: '1.25rem' }}>{f.icon}</div>
                                    <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>{f.title}</h3>
                                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{f.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* SLIDE 3 - CTA */}
                <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    textAlign: 'center',
                    opacity: current === 2 ? 1 : 0,
                    transform: current === 2 ? 'translateX(0)' : 'translateX(40px)',
                    transition: 'opacity 0.6s ease, transform 0.6s ease',
                    pointerEvents: current === 2 ? 'auto' : 'none'
                }}>
                    <div style={{ maxWidth: '600px', padding: '0 2rem' }}>
                        <p style={{ color: '#00d4a0', fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '1rem' }}>Sẵn sàng chưa?</p>
                        <h2 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: '900', letterSpacing: '-2px', textTransform: 'uppercase', marginBottom: '1.25rem', lineHeight: 1.1 }}>
                            SẴN SÀNG <span style={{ color: '#00d4a0' }}>BỨT</span><br />GIỚI HẠN?
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px', marginBottom: '2.5rem' }}>
                            Miễn phí hoàn toàn. Không cần thẻ tín dụng.
                        </p>
                        <button onClick={onGetStarted} style={{ ...primaryBtn, padding: '16px 48px' }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                            <Zap size={18} fill="#000" /> Bắt đầu ngay
                        </button>
                    </div>
                </div>
            </div>

            {/* ARROW LEFT */}
            <button
                onClick={prev}
                style={{ ...arrowBtn, left: '2rem' }}
                onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(0,212,160,0.15)';
                    e.currentTarget.style.borderColor = '#00d4a0';
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                }}
            >
                <ChevronLeft size={22} color='#fff' />
            </button>

            {/* ARROW RIGHT */}
            <button
                onClick={next}
                style={{ ...arrowBtn, right: '2rem' }}
                onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(0,212,160,0.15)';
                    e.currentTarget.style.borderColor = '#00d4a0';
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                }}
            >
                <ChevronRight size={22} color='#fff' />
            </button>

            {/* DOTS */}
            <div style={{ position: 'absolute', bottom: '2.5rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '10px', zIndex: 10 }}>
                {slides.map((_, i) => (
                    <div key={i} onClick={() => setCurrent(i)} style={{
                        width: current === i ? '28px' : '8px',
                        height: '8px',
                        borderRadius: '99px',
                        background: current === i ? '#00d4a0' : 'rgba(255,255,255,0.2)',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }} />
                ))}
            </div>

            {/* Footer */}
            <div style={{ position: 'absolute', bottom: '2.5rem', right: '4rem', display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.2)', fontSize: '12px', zIndex: 10 }}>
                <Dumbbell size={12} color='#00d4a0' />
                <span>© 2025 Gym Planner AI</span>
            </div>
        </div>
    )
}

export default LandingPage