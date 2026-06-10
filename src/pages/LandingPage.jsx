import { useState, useEffect, useRef } from 'react'
import { Dumbbell, Salad, Scale, BookOpen, Zap, ChevronRight, Star, Camera, TrendingUp, Shield, Menu, X } from 'lucide-react'
import '../styles/LandingPage.css'

function LandingPage({ onGetStarted }) {
    const [scrollY, setScrollY] = useState(0)
    const [visible, setVisible] = useState({})
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const refs = useRef({})

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 1000) {
                setMobileMenuOpen(false)
            }
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(e => {
                    if (e.isIntersecting) setVisible(v => ({ ...v, [e.target.dataset.id]: true }))
                })
            },
            { threshold: 0.15 }
        )
        Object.values(refs.current).forEach(r => r && observer.observe(r))
        return () => observer.disconnect()
    }, [])

    const setRef = (id) => (el) => {
        refs.current[id] = el
        if (el) el.dataset.id = id
    }

    const anim = (id, delay = 0) => ({
        opacity: visible[id] ? 1 : 0,
        transform: visible[id] ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
    })


    const features = [
        { icon: <Dumbbell size={28} strokeWidth={2} />, title: 'Lịch tập AI', desc: '...', tag: 'Cá nhân hóa' },
        { icon: <Camera size={28} strokeWidth={2} />, title: 'Phân tích dinh dưỡng', desc: '...', tag: 'AI Vision' },
        { icon: <Scale size={28} strokeWidth={2} />, title: 'Tính chỉ số BMI', desc: '...', tag: 'Sức khoẻ' },
        { icon: <BookOpen size={28} strokeWidth={2} />, title: 'Nhật ký tập luyện', desc: '...', tag: 'Theo dõi' },
    ]

    const navLinks = [
        { label: 'Trang chủ' },
        { label: 'Tính năng' },
        { label: 'Dinh dưỡng' },
        { label: 'Lịch tập' },
        { label: 'Về chúng tôi' },
    ]

    const stats = [
        { number: '10K+', label: 'Người dùng' },
        { number: '50K+', label: 'Buổi tập' },
        { number: '99%', label: 'Hài lòng' },
    ]

    return (
        <div className="landing-page" style={{ width: '100%', fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif", background: '#080808', color: '#fff' }}>
            {/* NAVBAR */}
            <nav className="landing-navbar">
                {/* Logo */}
                <div className="landing-logo">
                    <Dumbbell size={20} color='var(--accent)' strokeWidth={2} />
                    <span style={{ fontWeight: '700', fontSize: '15px', letterSpacing: '0.02em', textTransform: 'uppercase', color: '#fff' }}>Gym Planner AI</span>
                </div>

                {/* Desktop Menu */}
                <div className="nav-links-desktop" >
                    {navLinks.map((item, i) => (
                        <span key={i} style={{
                            fontSize: '13px',
                            fontWeight: '400',
                            color: 'rgba(255,255,255,0.55)',
                            cursor: 'pointer',
                            letterSpacing: '0',
                            transition: 'color 0.15s',
                            fontFamily: "'DM Sans', sans-serif",
                            whiteSpace: 'nowrap'
                        }}
                            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.9)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}
                        >{item.label}</span>
                    ))}
                </div>

                {/* Desktop Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                    <span onClick={onGetStarted} style={{
                        color: 'rgba(255,255,255,0.55)', fontSize: '13px', fontWeight: 400,
                        cursor: 'pointer', transition: 'color 0.15s', padding: '8px 12px',
                        fontFamily: "'DM Sans', sans-serif",
                    }}
                        onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}
                    >
                        Log in
                    </span>
                    <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.12)', margin: '0 4px' }} />
                    <button className="btn-primary" onClick={onGetStarted} style={{
                        background: 'transparent',
                        border: '1px solid rgba(255,255,255,0.25)',
                        color: '#fff',
                        borderRadius: '999px',
                        padding: '7px 18px',
                        fontSize: '13px',
                        fontWeight: '500',
                    }}>
                        Sign up
                    </button>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="mobile-menu-btn"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#fff',
                        cursor: 'pointer',
                        padding: '8px',
                        display: 'none',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    {mobileMenuOpen
                        ? <X size={24} strokeWidth={2} />
                        : <Menu size={24} strokeWidth={2} />
                    }
                </button>
            </nav>

            {/* Mobile Menu Overlay */}
            <div className="mobile-menu-overlay" style={{
                position: 'fixed',
                top: mobileMenuOpen ? '68px' : '-100%',
                left: 0,
                right: 0,
                background: 'rgba(8,8,8,0.98)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                padding: '1.5rem',
                zIndex: 999,
                transition: 'top 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
            }}>
                {navLinks.map((item, i) => (
                    <span
                        key={i}
                        style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            color: 'rgba(255,255,255,0.8)',
                            cursor: 'pointer',
                            padding: '14px 0',
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            fontFamily: "'Barlow', sans-serif",
                            letterSpacing: '0.02em'
                        }}
                        onClick={() => setMobileMenuOpen(false)}
                    >{item.label}</span>
                ))}
            </div>

            {/* HERO */}
            <section className="hero-section" style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden', background: '#080808' }}>
                {/* Hero image - right side */}
                <div style={{
                    position: 'absolute', right: 0, top: 0, bottom: 0,
                    width: '55%',
                    background: 'linear-gradient(to right, #080808 0%, transparent 30%)',
                    zIndex: 2,
                }} />
                <img
                    src="/src/assets/hero2.jpg"
                    alt=""
                    style={{
                        position: 'absolute', right: 0, top: 0,
                        width: '55%', height: '100%',
                        objectFit: 'cover', objectPosition: 'center top',
                        filter: 'brightness(0.7) contrast(1.1) grayscale(0.2)',
                    }}
                />
                {/* Red glow bottom */}
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 60% 100%, rgba(225,29,72,0.15) 0%, transparent 60%)', zIndex: 1 }} />
                {/* Left gradient overlay */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #080808 45%, rgba(8,8,8,0.5) 70%, transparent 100%)', zIndex: 1 }} />
                {/* Red accent line */}
                <div style={{ position: 'absolute', left: '5rem', top: '20%', bottom: '20%', width: '2px', background: 'linear-gradient(to bottom, transparent, var(--accent), transparent)', zIndex: 3 }} />

                {/* Hero content */}
                <div style={{ position: 'relative', zIndex: 4, padding: '0 6rem', maxWidth: '700px' }}>
                    {/* Badge */}
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        background: 'rgba(225,29,72,0.1)', border: '1px solid rgba(225,29,72,0.3)',
                        borderRadius: '999px', padding: '6px 14px', marginBottom: '2rem',
                        animation: 'fadeInUp 0.6s ease both',
                    }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)' }} />
                        <span style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.05em' }}>AI-POWERED FITNESS</span>
                    </div>

                    <h1 style={{
                        fontSize: 'clamp(52px, 7vw, 96px)',
                        fontWeight: 900,
                        lineHeight: 0.95,
                        textTransform: 'uppercase',
                        letterSpacing: '-2px',
                        marginBottom: '1.5rem',
                        fontFamily: "'Barlow Condensed', sans-serif",
                        animation: 'fadeInUp 0.7s ease 0.1s both',
                    }}>
                        SHAPE<br />
                        <span style={{ color: 'var(--accent)', WebkitTextStroke: '0px' }}>YOUR</span><br />
                        BODY
                    </h1>

                    <p style={{
                        fontSize: '16px', color: 'rgba(255,255,255,0.55)',
                        lineHeight: 1.7, marginBottom: '2.5rem', maxWidth: '420px',
                        fontFamily: "'DM Sans', sans-serif",
                        animation: 'fadeInUp 0.7s ease 0.2s both',
                    }}>
                        Lịch tập AI cá nhân hóa. Phân tích dinh dưỡng từ ảnh.<br />Hoàn toàn miễn phí.
                    </p>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', animation: 'fadeInUp 0.7s ease 0.3s both' }}>
                        <button className="btn-primary" onClick={onGetStarted} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 32px', fontSize: '14px', fontWeight: 700 }}>
                            <Zap size={16} /> Bắt đầu miễn phí
                        </button>
                        <span onClick={onGetStarted} style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            color: 'rgba(255,255,255,0.45)', fontSize: '14px', fontWeight: 400,
                            cursor: 'pointer', transition: 'color 0.2s',
                        }}
                            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}
                        >
                            Xem tính năng <ChevronRight size={14} />
                        </span>
                    </div>

                    {/* Stars */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2.5rem', animation: 'fadeInUp 0.7s ease 0.4s both' }}>
                        {[...Array(5)].map((_, i) => <Star key={i} size={13} fill='#fbbf24' color='#fbbf24' />)}
                        <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', fontFamily: "'DM Sans', sans-serif" }}>Được tin dùng bởi hàng ngàn người</span>
                    </div>
                </div>

                {/* Stats - bottom right */}
                <div style={{
                    position: 'absolute', right: '5rem', bottom: '4rem',
                    display: 'flex', gap: '3rem', zIndex: 4,
                    animation: 'fadeInUp 0.8s ease 0.5s both',
                }}>
                    {stats.map((s, i) => (
                        <div key={i} style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '36px', fontWeight: 900, color: 'var(--accent)', lineHeight: 1, fontFamily: "'Barlow Condensed', sans-serif" }}>{s.number}</div>
                            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '6px' }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Scroll indicator */}
                <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', zIndex: 4, animation: 'bounce 2s infinite' }}>
                    <div style={{ width: '1px', height: '48px', background: 'linear-gradient(to bottom, transparent, rgba(225,29,72,0.5))' }} />
                </div>
            </section>

            {/* FEATURES */}
            <section className="features-section">
                <div className="features-divider" />
                <div
                    ref={setRef('feat-title')}
                    className="features-header"
                    style={anim('feat-title')}
                >
                    <p style={{ color: 'var(--accent)', fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '12px' }}>Tính năng</p>
                    <h2 style={{ fontSize: 'clamp(24px, 3vw, 48px)', fontWeight: '900', letterSpacing: '-1px', textTransform: 'uppercase', lineHeight: 1 }}>MỌI THỨ ĐỂ <span style={{ color: 'var(--accent)' }}>BỨT PHÁ</span></h2>
                </div>
                <div className="features-grid">
                    {features.map((f, i) => (
                        <div key={i} ref={setRef(`feat-${i}`)} className="feature-card" style={{
                            ...anim(`feat-${i}`, i * 0.1),
                            flex: '0 0 280px',
                            scrollSnapAlign: 'start'
                        }}>
                            {/* phần content bên trong giữ nguyên */}
                        </div>
                    ))}
                </div>
            </section>

            {/* WHY */}
            <section className="why-section">
                <div className="why-divider-top" />
                <div className="why-divider-bottom" />
                <div
                    ref={setRef('why-title')}
                    className="why-header"
                    style={anim('why-title')}
                >
                    <p style={{ color: 'var(--accent)', fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '12px' }}>Tại sao chọn chúng tôi</p>
                    <h2 style={{ fontSize: 'clamp(24px, 3vw, 48px)', fontWeight: '900', letterSpacing: '-1px', textTransform: 'uppercase', lineHeight: 1 }}>
                        ĐƠN GIẢN. <span style={{ color: 'var(--accent)' }}>THÔNG MINH.</span> HIỆU QUẢ.
                    </h2>
                </div>
                <div className="why-grid">
                    {[
                        { icon: <Zap size={28} strokeWidth={2} />, title: 'Nhanh chóng', desc: 'Chụp ảnh bữa ăn — có kết quả dinh dưỡng trong vài giây', tag: 'AI' },
                        { icon: <TrendingUp size={28} strokeWidth={2} />, title: 'Theo dõi tiến trình', desc: 'Nhật ký tập luyện giúp bạn thấy rõ sự tiến bộ theo từng tuần', tag: 'Smart' },
                        { icon: <Shield size={28} strokeWidth={2} />, title: 'Hoàn toàn miễn phí', desc: 'Không cần thẻ tín dụng, không giới hạn tính năng cơ bản', tag: 'Free' },
                    ].map((item, i) => (
                        <div key={i} ref={setRef(`why-${i}`)} className="feature-card" style={{ ...anim(`why-${i}`, i * 0.12) }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                <div style={{ color: 'var(--accent)' }}>{item.icon}</div>
                                <span style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(0,212,160,0.6)', border: '1px solid rgba(0,212,160,0.2)', borderRadius: '2px', padding: '3px 8px' }}>{item.tag}</span>
                            </div>
                            <h3 style={{ fontSize: '20px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: '10px' }}>{item.title}</h3>
                            <p style={{ fontSize: '14px', fontFamily: "'Barlow', sans-serif", color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="cta-section">
                <img src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1600&q=80" alt="" className="cta-bg" />
                <div className="cta-overlay" />
                <div ref={setRef('cta')} className="cta-content"
                    style={anim('cta')}
                >
                    <p style={{ color: 'var(--accent)', fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1.5rem' }}>Sẵn sàng chưa?</p>
                    <h2 style={{ fontSize: 'clamp(20px, 2.5vw, 36px)', fontWeight: '900', letterSpacing: '-1px', textTransform: 'uppercase', lineHeight: 1 }}>SẴN SÀNG<br /><span style={{ color: 'var(--accent)' }}>BỨT GIỚI HẠN?</span></h2>
                    <p className="cta-description">Miễn phí hoàn toàn. Không cần thẻ tín dụng.</p>
                    <button className="btn-primary" onClick={onGetStarted} style={{ fontSize: '17px', padding: '18px 56px' }}><Zap size={17} fill="#000" strokeWidth={0} /> Bắt đầu ngay</button>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="landing-footer">
                <div className="footer-grid">

                    {/* Logo + desc + social */}
                    <div>
                        <div className="footer-logo">
                            <Dumbbell size={20} color='var(--accent)' />
                            <span style={{ fontWeight: '900', fontSize: '16px', textTransform: 'uppercase' }}>Gym Planner AI</span>
                        </div>
                        <p style={{ fontSize: '13px', fontFamily: "'Barlow', sans-serif", color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                            Ứng dụng tập luyện thông minh — cá nhân hóa lịch tập và phân tích dinh dưỡng bằng AI.
                        </p>
                        <div className="footer-social">
                            {['IG', 'TK', 'FB', 'YT'].map((s, i) => (
                                <div key={i} style={{ width: '34px', height: '34px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', transition: 'all 0.2s' }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
                                >{s}</div>
                            ))}
                        </div>
                    </div>

                    {/* Các cột links */}
                    {[
                        {
                            title: 'Sản phẩm',
                            links: ['Tính năng', 'Lịch tập AI', 'Dinh dưỡng', 'Nhật ký', 'Tính BMI']
                        },
                        {
                            title: 'Công ty',
                            links: ['Về chúng tôi', 'Liên hệ', 'Tuyển dụng', 'Blog']
                        },
                        {
                            title: 'Tài nguyên',
                            links: ['Hướng dẫn', 'Bài viết', 'Thư viện bài tập', 'API công khai']
                        },
                        {
                            title: 'Hướng dẫn tập',
                            links: ['Tăng cơ', 'Giảm mỡ', 'Tăng sức bền', 'Lịch 3 ngày', 'Lịch 5 ngày']
                        },
                    ].map((col, i) => (
                        <div key={i}>
                            <div style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#fff', marginBottom: '1rem' }}>{col.title}</div>
                            {col.links.map((link, j) => (
                                <div key={j} style={{ fontSize: '13px', fontFamily: "'Barlow', sans-serif", color: 'rgba(255,255,255,0.4)', marginBottom: '10px', cursor: 'pointer', transition: 'color 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                                >{link}</div>
                            ))}
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div className="footer-bottom">
                    <span style={{ fontSize: '12px', fontFamily: "'Barlow', sans-serif", color: 'rgba(255,255,255,0.25)' }}>
                        © 2025 Gym Planner AI. All rights reserved.
                    </span>
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        {['Điều khoản', 'Bảo mật', 'Cookie'].map((item, i) => (
                            <span key={i} style={{ fontSize: '12px', fontFamily: "'Barlow', sans-serif", color: 'rgba(255,255,255,0.25)', cursor: 'pointer', transition: 'color 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.25)'}
                            >{item}</span>
                        ))}
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default LandingPage
