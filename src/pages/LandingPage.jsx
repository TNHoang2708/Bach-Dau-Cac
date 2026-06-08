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
                    <Dumbbell size={22} color='var(--accent)' strokeWidth={2.5} />
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                    <button className="btn-ghost" onClick={onGetStarted}>
                        Log in
                    </button>
                    <button className="btn-primary" onClick={onGetStarted}>
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
            <section className="hero-section">
                <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=80" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', filter: 'brightness(0.5) contrast(1.1)' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg, rgba(8,8,8,1) 40%, rgba(8,8,8,0.3) 70%, transparent 100%)' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,212,160,0.15) 0%, transparent 40%)' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 70% 50%, transparent 30%, rgba(8,8,8,0.6) 100%)' }} />
                <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: '3px', background: 'linear-gradient(to bottom, transparent, var(--accent), transparent)' }} />

                <div className="hero-content">
                    <h1 className="hero-title">
                        SHAPE YOUR<br /><span style={{ color: 'var(--accent)' }}>BODY</span><br />WITH AI
                    </h1>
                    <p className="hero-description">
                        Lịch tập cá nhân hóa, phân tích dinh dưỡng từ ảnh thông minh — hoàn toàn miễn phí.
                    </p>
                    <div style={{ animation: 'fadeInUp 0.8s ease 0.3s both' }}>
                        <button className="btn-primary" onClick={onGetStarted}><Zap size={15} fill="#000" strokeWidth={0} /> Bắt đầu miễn phí</button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2rem', animation: 'fadeInUp 0.8s ease 0.4s both' }}>
                        {[...Array(5)].map((_, i) => <Star key={i} size={13} fill='#fbbf24' color='#fbbf24' />)}
                        <span style={{ fontSize: '13px', fontFamily: "'Barlow', sans-serif", color: 'rgba(255,255,255,0.35)' }}>Được tin dùng bởi hàng ngàn người</span>
                    </div>
                </div>

                <div style={{ position: 'absolute', right: '5rem', bottom: '4rem', display: 'flex', gap: '4rem', animation: 'fadeInUp 0.8s ease 0.5s both' }}>
                    {stats.map((s, i) => (
                        <div key={i}>
                            <div style={{ fontSize: '40px', fontWeight: '900', color: 'var(--accent)', lineHeight: 1 }}>{s.number}</div>
                            <div style={{ fontSize: '11px', fontFamily: "'Barlow', sans-serif", color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '6px' }}>{s.label}</div>
                        </div>
                    ))}
                </div>
                <div style={{ position: 'absolute', bottom: '2.5rem', left: '50%', transform: 'translateX(-50%)', animation: 'bounce 2s infinite' }}>
                    <div style={{ width: '1px', height: '48px', background: 'linear-gradient(to bottom, transparent, rgba(0,212,160,0.5))' }} />
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
