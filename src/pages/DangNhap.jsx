import { useState } from 'react'
import { auth, googleProvider } from '../firebase'
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup
} from 'firebase/auth'
import { Dumbbell, ArrowLeft, LogIn, UserPlus, Loader } from 'lucide-react'

function DangNhap({ onBack }) {
    const [isLogin, setIsLogin] = useState(true)
    const [email, setEmail] = useState('')
    const [matKhau, setMatKhau] = useState('')
    const [loading, setLoading] = useState(false)
    const [loi, setLoi] = useState('')

    const handleEmail = async () => {
        if (!email || !matKhau) { setLoi('Vui lòng nhập đầy đủ thông tin!'); return }
        setLoading(true); setLoi('')
        try {
            if (isLogin) await signInWithEmailAndPassword(auth, email, matKhau)
            else await createUserWithEmailAndPassword(auth, email, matKhau)
        } catch (err) {
            if (err.code === 'auth/invalid-credential') setLoi('Email hoặc mật khẩu không đúng!')
            else if (err.code === 'auth/email-already-in-use') setLoi('Email này đã được đăng ký!')
            else if (err.code === 'auth/weak-password') setLoi('Mật khẩu phải có ít nhất 6 ký tự!')
            else if (err.code === 'auth/invalid-email') setLoi('Email không hợp lệ!')
            else setLoi('Có lỗi xảy ra, thử lại nhé!')
        }
        setLoading(false)
    }

    const handleGoogle = async () => {
        setLoading(true); setLoi('')
        try { await signInWithPopup(auth, googleProvider) }
        catch (err) { setLoi('Đăng nhập Google thất bại, thử lại nhé!') }
        setLoading(false)
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#080808',
            position: 'relative',
            padding: '2rem',
        }}>


            {/* Card */}
            <div style={{
                background: 'transparent',
                border: 'none',
                borderRadius: '0',
                padding: '2.5rem',
                width: '100%',
                maxWidth: '420px',
            }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ margin: '0 auto 16px', display: 'flex', justifyContent: 'center' }}>
                        <Dumbbell size={28} color='var(--accent)' />
                    </div>
                    <h2 style={{
                        fontSize: '22px', fontWeight: '700',
                        background: 'linear-gradient(135deg, #fff 0%, var(--accent) 100%)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        marginBottom: '4px'
                    }}>Gym Planner AI</h2>
                    <p style={{ color: '#aaa', fontSize: '14px' }}>
                        {isLogin ? 'Đăng nhập để tiếp tục' : 'Tạo tài khoản mới'}
                    </p>
                </div>

                {/* Tab */}
                <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px',
                    background: '#1a1a1a', padding: '4px', borderRadius: '12px',
                    marginBottom: '1.5rem'
                }}>
                    {[
                        { label: 'Đăng nhập', icon: <LogIn size={14} />, val: true },
                        { label: 'Đăng ký', icon: <UserPlus size={14} />, val: false },
                    ].map((tab, i) => (
                        <button key={i} onClick={() => { setIsLogin(tab.val); setLoi('') }} style={{
                            padding: '10px', margin: 0,
                            background: isLogin === tab.val ? 'var(--accent)' : 'transparent',
                            color: isLogin === tab.val ? '#000' : '#aaa',
                            borderRadius: '10px', fontSize: '14px', fontWeight: '600',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                            width: '100%', border: 'none', cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}>
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* Form */}
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: '13px', color: '#aaa', display: 'block', marginBottom: '6px' }}>Email</label>
                    <input type="email" placeholder="example@gmail.com" value={email}
                        onChange={e => setEmail(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleEmail()} />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ fontSize: '13px', color: '#aaa', display: 'block', marginBottom: '6px' }}>Mật khẩu</label>
                    <input type="password" placeholder="Tối thiểu 6 ký tự" value={matKhau}
                        onChange={e => setMatKhau(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleEmail()} />
                </div>

                {/* Lỗi */}
                {loi && (
                    <div style={{
                        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                        borderRadius: '10px', padding: '10px 14px', marginBottom: '1rem',
                        fontSize: '13px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px'
                    }}>
                        ⚠️ {loi}
                    </div>
                )}

                {/* Nút đăng nhập/đăng ký */}
                <button onClick={handleEmail} disabled={loading} style={{
                    marginBottom: '12px', opacity: loading ? 0.7 : 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    width: '100%',
                }}>
                    {loading
                        ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Đang xử lý...</>
                        : isLogin
                            ? <><LogIn size={16} /> Đăng nhập</>
                            : <><UserPlus size={16} /> Tạo tài khoản</>
                    }
                </button>

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ flex: 1, height: '1px', background: '#2a2a2a' }} />
                    <span style={{ fontSize: '12px', color: '#aaa' }}>hoặc</span>
                    <div style={{ flex: 1, height: '1px', background: '#2a2a2a' }} />
                </div>

                {/* Google */}
                <button onClick={handleGoogle} disabled={loading} style={{
                    background: '#1a1a1a', color: '#fff', border: '1px solid #2a2a2a',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    opacity: loading ? 0.7 : 1, width: '100%',
                    transition: 'border-color 0.2s',
                }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2a2a'}
                >
                    <svg width="18" height="18" viewBox="0 0 48 48">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                    </svg>
                    Đăng nhập bằng Google
                </button>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    )
}

export default DangNhap
