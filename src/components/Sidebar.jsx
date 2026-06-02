import { Dumbbell, Home, Salad, Scale, BookOpen, LogOut, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'

function Sidebar({ isOpen, onClose }) {
    const { user, dangXuat } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const menuItems = [
        { path: '/', icon: <Home size={20} />, label: 'Lịch tập' },
        { path: '/dinh-duong', icon: <Salad size={20} />, label: 'Dinh dưỡng' },
        { path: '/bmi', icon: <Scale size={20} />, label: 'BMI' },
        { path: '/nhat-ky', icon: <BookOpen size={20} />, label: 'Nhật ký' },
    ]

    const handleNavigation = (path) => {
        navigate(path)
        if (window.innerWidth <= 1024) onClose()
    }

    return (
        <>
            {/* Overlay tối - chỉ hiện khi sidebar mở trên mobile/tablet */}
            {isOpen && window.innerWidth <= 1024 && (
                <div
                    className="sidebar-overlay"
                    onClick={onClose}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.5)',
                        zIndex: 998,
                        transition: 'opacity 0.25s ease'
                    }}
                />
            )}

            {/* Sidebar */}
            <div className={`sidebar ${isOpen ? 'open' : ''}`} style={{
                position: 'fixed',
                top: 0,
                left: 0,
                bottom: 0,
                width: '280px',
                background: 'var(--card)',
                borderRight: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 999,
                transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                willChange: 'transform',
                transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
            }}>
                {/* Header với logo và nút X */}
                <div style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Dumbbell size={28} color='#00d4a0' strokeWidth={2.5} />
                        <span style={{ fontWeight: '900', fontSize: '20px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                            Gym Planner AI
                        </span>
                    </div>
                    {/* Nút X - hiện trên mobile và tablet (khi sidebar được mở bằng nút menu) */}
                    <button
                        onClick={onClose}
                        className="sidebar-close-btn"
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            padding: '8px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* User Info */}
                <div style={{
                    padding: '0 1rem 1rem 1rem',
                    borderBottom: '1px solid var(--border)',
                    marginBottom: '1rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                            src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.email || 'User'}&background=00d4a0&color=000`}
                            alt="avatar"
                            style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: '2px solid #00d4a0'
                            }}
                        />
                        <div>
                            <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text)' }}>
                                {user?.displayName || 'User'}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                {user?.email}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Menu Items */}
                <div style={{ flex: 1, padding: '0 0.75rem' }}>
                    {menuItems.map((item) => (
                        <div
                            key={item.path}
                            onClick={() => handleNavigation(item.path)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                marginBottom: '4px',
                                cursor: 'pointer',
                                background: location.pathname === item.path ? 'var(--accent-dim)' : 'transparent',
                                color: location.pathname === item.path ? 'var(--accent)' : 'var(--text-secondary)',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                if (location.pathname !== item.path) {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                                    e.currentTarget.style.color = 'var(--text)'
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (location.pathname !== item.path) {
                                    e.currentTarget.style.background = 'transparent'
                                    e.currentTarget.style.color = 'var(--text-secondary)'
                                }
                            }}
                        >
                            {item.icon}
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>{item.label}</span>
                        </div>
                    ))}
                </div>

                {/* Đăng xuất */}
                <div style={{ padding: '1rem 0.75rem', borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
                    <div
                        onClick={dangXuat}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            color: '#ef4444',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                        <LogOut size={20} />
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>Đăng xuất</span>
                    </div>
                </div>
            </div>

            <style>{`
                /* Tablet: ẩn nút X trên desktop (khi sidebar tự hiện) */
                @media (min-width: 1025px) {
                    .sidebar-close-btn {
                        display: none !important;
                    }
                }

                /* Mobile và Tablet nhỏ: hiển thị nút X */
                @media (max-width: 1024px) {
                    .sidebar-close-btn {
                        display: flex !important;
                    }
                }
            `}</style>
        </>
    )
}

export default Sidebar