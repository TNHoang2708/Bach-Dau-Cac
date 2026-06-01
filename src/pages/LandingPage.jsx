import { useState, useEffect, useRef } from 'react'
import { Dumbbell, Salad, Scale, BookOpen, Zap, ChevronRight, Star, Camera, TrendingUp, Shield } from 'lucide-react'

function LandingPage({ onGetStarted }) {
    const [scrollY, setScrollY] = useState(0)
    const [visible, setVisible] = useState({})
    const refs = useRef({})

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
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
        { icon: <Dumbbell size={28} />, title: 'Lịch tập AI', desc: 'AI tạo lịch tập cá nhân hóa theo thể trạng, mục tiêu và lịch trình của bạn', tag: 'Cá nhân hóa' },
        { icon: <Camera size={28} />, title: 'Phân tích dinh dưỡng', desc: 'Chụp ảnh bữa ăn — AI nhận diện món ăn và phân tích calo, protein, carb, fat ngay lập tức', tag: 'AI Vision' },
        { icon: <Scale size={28} />, title: 'Tính chỉ số BMI', desc: 'Tính BMI, TDEE, cân nặng lý tưởng và lượng calo cần thiết mỗi ngày', tag: 'Sức khoẻ' },
        { icon: <BookOpen size={28} />, title: 'Nhật ký tập luyện', desc: 'Ghi lại sets, reps, kg từng buổi tập — theo dõi tiến trình theo thời gian thực', tag: 'Theo dõi' },
    ]

    const stats = [
        { number: '10K+', label: 'Người dùng' },
        { number: '50K+', label: 'Buổi tập' },
        { number: '99%', label: 'Hài lòng' },
    ]

    return (
        <div className="landing-page" style={{ width: '100%', fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif", background: '#080808', color: '#fff' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@400;500;600&display=swap');
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { overflow-x: hidden; }
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-track { background: #080808; }
                ::-webkit-scrollbar-thumb { background: #00d4a0; border-radius: 2px; }
                .btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 16px 40px; font-size: 15px; font-weight: 800; font-family: 'Barlow Condensed', sans-serif; letter-spacing: 0.1em; text-transform: uppercase; background: #00d4a0; color: #000; border: none; border-radius: 4px; cursor: pointer; transition: all 0.25s ease; }
                .btn-primary:hover { background: #00ffbf; transform: translateY(-2px); box-shadow: 0 12px 40px rgba(0,212,160,0.35); }
                .btn-ghost { display: inline-flex; align-items: center; gap: 6px; padding: 10px 24px; font-size: 14px; font-weight: 700; font-family: 'Barlow Condensed', sans-serif; letter-spacing: 0.05em; text-transform: uppercase; background: transparent; color: #fff; border: 1px solid rgba(255,255,255,0.25); border-radius: 4px; cursor: pointer; transition: all 0.25s ease; }
                .btn-ghost:hover { border-color: #00d4a0; color: #00d4a0; }
                .feature-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 2.5rem 2rem; transition: all 0.3s ease; cursor: default; }
                .feature-card:hover { background: rgba(0,212,160,0.05); border-color: rgba(0,212,160,0.25); transform: translateY(-4px); }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes bounce { 0%, 100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(8px); } }
            `}</style>

            {/* NAVBAR */}
            <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 5rem', background: scrollY > 50 ? 'rgba(8,8,8,0.95)' : 'transparent', borderBottom: scrollY > 50 ? '1px solid rgba(255,255,255,0.06)' : 'none', backdropFilter: scrollY > 50 ? 'blur(20px)' : 'none', transition: 'all 0.4s ease', zIndex: 1000 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Dumbbell size={22} color='#00d4a0' strokeWidth={2.5} />
                    <span style={{ fontWeight: '900', fontSize: '18px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Gym Planner AI</span>
                </div>
                <button className="btn-ghost" onClick={onGetStarted}>Đăng nhập <ChevronRight size={14} /></button>
            </nav>

            {/* HERO */}
            <section style={{ minHeight: '100vh', position: 'relative', display: 'flex', alignItems: 'center', padding: '0 5rem' }}>
                <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=80" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', filter: 'brightness(0.5) contrast(1.1)' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg, rgba(8,8,8,1) 40%, rgba(8,8,8,0.3) 70%, transparent 100%)' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,212,160,0.15) 0%, transparent 40%)' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 70% 50%, transparent 30%, rgba(8,8,8,0.6) 100%)' }} />
                <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: '3px', background: 'linear-gradient(to bottom, transparent, #00d4a0, transparent)' }} />

                <div style={{ position: 'relative', zIndex: 1, maxWidth: '680px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0,212,160,0.1)', border: '1px solid rgba(0,212,160,0.25)', borderRadius: '2px', padding: '6px 14px', fontSize: '11px', color: '#00d4a0', fontWeight: '700', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '2rem', animation: 'fadeInUp 0.8s ease both' }}>
                        <Zap size={11} fill="#00d4a0" strokeWidth={0} /> Powered by Gemini AI
                    </div>
                    <h1 style={{ fontSize: 'clamp(52px, 7vw, 96px)', fontWeight: '900', lineHeight: 0.95, letterSpacing: '-1px', textTransform: 'uppercase', marginBottom: '1.75rem', animation: 'fadeInUp 0.8s ease 0.1s both' }}>
                        SHAPE YOUR<br /><span style={{ color: '#00d4a0' }}>BODY</span><br />WITH AI
                    </h1>
                    <p style={{ fontSize: '17px', fontFamily: "'Barlow', sans-serif", color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, marginBottom: '2.5rem', maxWidth: '440px', animation: 'fadeInUp 0.8s ease 0.2s both' }}>
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
                            <div style={{ fontSize: '40px', fontWeight: '900', color: '#00d4a0', lineHeight: 1 }}>{s.number}</div>
                            <div style={{ fontSize: '11px', fontFamily: "'Barlow', sans-serif", color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '6px' }}>{s.label}</div>
                        </div>
                    ))}
                </div>
                <div style={{ position: 'absolute', bottom: '2.5rem', left: '50%', transform: 'translateX(-50%)', animation: 'bounce 2s infinite' }}>
                    <div style={{ width: '1px', height: '48px', background: 'linear-gradient(to bottom, transparent, rgba(0,212,160,0.5))' }} />
                </div>
            </section>

            {/* FEATURES */}
            <section style={{ padding: '8rem 5rem', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: '5rem', right: '5rem', height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                <div ref={setRef('feat-title')} style={{ marginBottom: '3rem', ...anim('feat-title') }}>
                    <p style={{ color: '#00d4a0', fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '12px' }}>Tính năng</p>
                    <h2 style={{ fontSize: 'clamp(24px, 3vw, 48px)', fontWeight: '900', letterSpacing: '-1px', textTransform: 'uppercase', lineHeight: 1 }}>MỌI THỨ ĐỂ <span style={{ color: '#00d4a0' }}>BỨT PHÁ</span></h2>
                </div>
                <div className="features-grid">
                    {features.map((f, i) => (
                        <div key={i} ref={setRef(`feat-${i}`)} className="feature-card" style={{ ...anim(`feat-${i}`, i * 0.1) }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                <div style={{ color: '#00d4a0' }}>{f.icon}</div>
                                <span style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(0,212,160,0.6)', border: '1px solid rgba(0,212,160,0.2)', borderRadius: '2px', padding: '3px 8px' }}>{f.tag}</span>
                            </div>
                            <h3 style={{ fontSize: '20px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: '10px' }}>{f.title}</h3>
                            <p style={{ fontSize: '14px', fontFamily: "'Barlow', sans-serif", color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* WHY */}
            <section style={{ padding: '8rem 5rem', background: 'rgba(0,212,160,0.03)', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'rgba(0,212,160,0.1)' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', background: 'rgba(0,212,160,0.1)' }} />
                <div ref={setRef('why-title')} style={{ marginBottom: '3rem', ...anim('why-title') }}>
                    <p style={{ color: '#00d4a0', fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '12px' }}>Tại sao chọn chúng tôi</p>
                    <h2 style={{ fontSize: 'clamp(24px, 3vw, 48px)', fontWeight: '900', letterSpacing: '-1px', textTransform: 'uppercase', lineHeight: 1 }}>
                        ĐƠN GIẢN. <span style={{ color: '#00d4a0' }}>THÔNG MINH.</span> HIỆU QUẢ.
                    </h2>
                </div>
                <div className="why-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', maxWidth: '960px' }}>
                    {[
                        { icon: <Zap size={28} />, title: 'Nhanh chóng', desc: 'Chụp ảnh bữa ăn — có kết quả dinh dưỡng trong vài giây', tag: 'AI' },
                        { icon: <TrendingUp size={28} />, title: 'Theo dõi tiến trình', desc: 'Nhật ký tập luyện giúp bạn thấy rõ sự tiến bộ theo từng tuần', tag: 'Smart' },
                        { icon: <Shield size={28} />, title: 'Hoàn toàn miễn phí', desc: 'Không cần thẻ tín dụng, không giới hạn tính năng cơ bản', tag: 'Free' },
                    ].map((item, i) => (
                        <div key={i} ref={setRef(`why-${i}`)} className="feature-card" style={{ ...anim(`why-${i}`, i * 0.12) }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                <div style={{ color: '#00d4a0' }}>{item.icon}</div>
                                <span style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(0,212,160,0.6)', border: '1px solid rgba(0,212,160,0.2)', borderRadius: '2px', padding: '3px 8px' }}>{item.tag}</span>
                            </div>
                            <h3 style={{ fontSize: '20px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: '10px' }}>{item.title}</h3>
                            <p style={{ fontSize: '14px', fontFamily: "'Barlow', sans-serif", color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section style={{ padding: '10rem 5rem', textAlign: 'center', position: 'relative' }}>
                <img src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1600&q=80" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.15)' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,8,8,0.7)' }} />
                <div ref={setRef('cta')} style={{ position: 'relative', zIndex: 1, ...anim('cta') }}>
                    <p style={{ color: '#00d4a0', fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1.5rem' }}>Sẵn sàng chưa?</p>
                    <h2 style={{ fontSize: 'clamp(40px, 6vw, 80px)', fontWeight: '900', letterSpacing: '-2px', textTransform: 'uppercase', lineHeight: 0.95, marginBottom: '1.5rem' }}>SẴN SÀNG<br /><span style={{ color: '#00d4a0' }}>BỨT GIỚI HẠN?</span></h2>
                    <p style={{ fontFamily: "'Barlow', sans-serif", color: 'rgba(255,255,255,0.45)', fontSize: '17px', marginBottom: '3rem' }}>Miễn phí hoàn toàn. Không cần thẻ tín dụng.</p>
                    <button className="btn-primary" onClick={onGetStarted} style={{ fontSize: '17px', padding: '18px 56px' }}><Zap size={17} fill="#000" strokeWidth={0} /> Bắt đầu ngay</button>
                </div>
            </section>

            {/* FOOTER */}
            <footer style={{ padding: '2rem 5rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Dumbbell size={16} color='#00d4a0' />
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>© 2025 Gym Planner AI</span>
                </div>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', fontFamily: "'Barlow', sans-serif" }}>Powered by Gemini AI</span>
            </footer>
        </div>
    )
}

export default LandingPage
