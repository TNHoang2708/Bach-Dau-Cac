import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore'
import { Star, Bug, Lightbulb, Send, CheckCircle } from 'lucide-react'

function Feedback() {
    const { user } = useAuth()
    const [loai, setLoai] = useState('danhgia')
    const [sao, setSao] = useState(0)
    const [hover, setHover] = useState(0)
    const [noiDung, setNoiDung] = useState('')
    const [tieuDe, setTieuDe] = useState('')
    const [loading, setLoading] = useState(false)
    const [done, setDone] = useState(false)
    const [testimonials, setTestimonials] = useState([])

    useEffect(() => { fetchTestimonials() }, [])

    const fetchTestimonials = async () => {
        try {
            const snap = await getDocs(collection(db, 'feedback'))
            const data = snap.docs
                .map(d => ({ id: d.id, ...d.data() }))
                .filter(d => d.loai === 'danhgia' && d.sao >= 4)
                .sort((a, b) => b.sao - a.sao)
                .slice(0, 6)
            setTestimonials(data)
        } catch (e) { console.error(e) }
    }

    const tabs = [
        { key: 'danhgia', label: 'Đánh giá', icon: <Star size={15} /> },
        { key: 'loi', label: 'Báo lỗi', icon: <Bug size={15} /> },
        { key: 'goiy', label: 'Góp ý', icon: <Lightbulb size={15} /> },
    ]

    const reset = () => { setSao(0); setNoiDung(''); setTieuDe(''); setDone(false) }

    const guiFeedback = async () => {
        if (loai === 'danhgia' && sao === 0) { alert('Vui lòng chọn số sao!'); return }
        if (!noiDung.trim()) { alert('Vui lòng nhập nội dung!'); return }
        setLoading(true)
        try {
            await addDoc(collection(db, 'feedback'), {
                loai, sao: loai === 'danhgia' ? sao : null,
                tieuDe, noiDung,
                userId: user.uid, email: user.email,
                tenUser: user.displayName || user.email,
                thoiGian: serverTimestamp()
            })
            setDone(true)
            fetchTestimonials()
        } catch (e) { alert('Có lỗi xảy ra, thử lại nhé!') }
        setLoading(false)
    }

    return (
        <div>
            <div className="card">
                <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Send size={16} /> Gửi phản hồi
                </div>

                {done ? (
                    <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                        <CheckCircle size={48} style={{ color: 'var(--accent)', margin: '0 auto 1rem' }} />
                        <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>Cảm ơn bạn! 🎉</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '14px' }}>
                            {loai === 'danhgia' ? 'Đánh giá của bạn giúp chúng tôi cải thiện sản phẩm!' :
                                loai === 'loi' ? 'Chúng tôi sẽ xem xét và sửa lỗi sớm nhất!' : 'Góp ý của bạn rất quý giá!'}
                        </p>
                        <button onClick={reset} style={{ width: 'auto', padding: '10px 24px', fontSize: '14px' }}>Gửi thêm feedback</button>
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '1.5rem', background: 'var(--card2)', padding: '4px', borderRadius: '12px' }}>
                            {tabs.map(tab => (
                                <button key={tab.key} onClick={() => { setLoai(tab.key); reset() }} style={{
                                    padding: '10px', background: loai === tab.key ? 'var(--accent)' : 'transparent',
                                    color: loai === tab.key ? '#000' : 'var(--text-secondary)',
                                    borderRadius: '10px', fontSize: '14px', fontWeight: '600',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', margin: 0
                                }}>{tab.icon} {tab.label}</button>
                            ))}
                        </div>

                        {loai === 'danhgia' && (
                            <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>Bạn đánh giá Gym Planner AI thế nào?</p>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <Star key={i} size={36}
                                            fill={(hover || sao) >= i ? '#fbbf24' : 'transparent'}
                                            color={(hover || sao) >= i ? '#fbbf24' : 'var(--border)'}
                                            style={{ cursor: 'pointer', transition: 'all 0.15s' }}
                                            onClick={() => setSao(i)}
                                            onMouseEnter={() => setHover(i)}
                                            onMouseLeave={() => setHover(0)}
                                        />
                                    ))}
                                </div>
                                {sao > 0 && (
                                    <p style={{ fontSize: '13px', color: 'var(--accent)', marginTop: '8px', fontWeight: '600' }}>
                                        {sao === 1 ? 'Rất tệ 😞' : sao === 2 ? 'Tệ 😕' : sao === 3 ? 'Bình thường 😐' : sao === 4 ? 'Tốt 😊' : 'Tuyệt vời! 🤩'}
                                    </p>
                                )}
                            </div>
                        )}

                        {loai !== 'danhgia' && (
                            <div className="field" style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                    {loai === 'loi' ? <Bug size={14} /> : <Lightbulb size={14} />}
                                    {loai === 'loi' ? 'Lỗi xảy ra ở đâu?' : 'Tính năng bạn muốn góp ý?'}
                                </label>
                                <input type="text"
                                    placeholder={loai === 'loi' ? 'VD: Trang Dinh dưỡng bị lỗi khi...' : 'VD: Tính năng theo dõi cân nặng'}
                                    value={tieuDe} onChange={e => setTieuDe(e.target.value)} />
                            </div>
                        )}

                        <div className="field" style={{ marginBottom: '1.5rem' }}>
                            <label style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                                {loai === 'danhgia' ? 'Ý kiến của bạn' : loai === 'loi' ? 'Mô tả chi tiết lỗi' : 'Mô tả chi tiết góp ý'}
                            </label>
                            <textarea
                                placeholder={loai === 'danhgia' ? 'Chia sẻ trải nghiệm của bạn...' : loai === 'loi' ? 'Mô tả lỗi bạn gặp phải...' : 'Mô tả tính năng bạn muốn thêm...'}
                                value={noiDung} onChange={e => setNoiDung(e.target.value)} rows={4}
                                style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '1px solid var(--border)', borderRadius: '10px', background: 'var(--card2)', color: 'var(--text)', outline: 'none', resize: 'vertical', fontFamily: 'inherit', transition: 'border-color 0.2s' }}
                                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                                onBlur={e => e.target.style.borderColor = 'var(--border)'}
                            />
                        </div>

                        <button onClick={guiFeedback} disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: loading ? 0.7 : 1 }}>
                            <Send size={16} /> {loading ? 'Đang gửi...' : 'Gửi phản hồi'}
                        </button>
                    </>
                )}
            </div>

            {testimonials.length > 0 && (
                <div className="card">
                    <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Star size={16} /> Đánh giá từ người dùng ({testimonials.length})
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
                        {testimonials.map((t) => (
                            <div key={t.id} style={{ background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem' }}>
                                <div style={{ display: 'flex', gap: '4px', marginBottom: '10px' }}>
                                    {[...Array(t.sao)].map((_, j) => <Star key={j} size={14} fill='#fbbf24' color='#fbbf24' />)}
                                </div>
                                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '12px' }}>"{t.noiDung}"</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <img src={`https://ui-avatars.com/api/?name=${t.tenUser}&background=00d4a0&color=000&size=32`} alt=""
                                        style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                                    <div>
                                        <div style={{ fontSize: '13px', fontWeight: '600' }}>{t.tenUser}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Người dùng</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Feedback
