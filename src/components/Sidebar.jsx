import { Home, Salad, Scale, BookOpen, LogOut, PanelLeft, Settings, HelpCircle, ChevronUp, Globe, ArrowUpCircle, Download, Info, ChevronRight, MessageSquare } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'

function Sidebar({ isOpen, isCollapsed, isDesktop, onToggleCollapse, onClose }) {
    const { user, dangXuat } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const menuItems = [
        { path: '/', icon: <Home size={20} strokeWidth={2} />, label: 'Lịch tập' },
        { path: '/dinh-duong', icon: <Salad size={20} strokeWidth={2} />, label: 'Dinh dưỡng' },
        { path: '/bmi', icon: <Scale size={20} strokeWidth={2} />, label: 'BMI' },
        { path: '/nhat-ky', icon: <BookOpen size={20} strokeWidth={2} />, label: 'Nhật ký' },
        { path: '/feedback', icon: <MessageSquare size={20} strokeWidth={2} />, label: 'Feedback' },
    ]

    const [showUserMenu, setShowUserMenu] = useState(false)
    const userMenuRef = useRef(null)

    useEffect(() => {
        const handle = (e) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setShowUserMenu(false)
            }
        }
        document.addEventListener('mousedown', handle)
        return () => document.removeEventListener('mousedown', handle)
    }, [])

    const handleNavigation = (path) => {
        navigate(path)
        if (window.innerWidth <= 1024) onClose()
    }

    const w = isCollapsed ? '64px' : '280px'

    // Reusable row renderer
    const renderRow = ({ icon, label, shortcut, trailing, danger, onClick }) => (
        <div
            onClick={onClick}
            style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
                fontSize: '14px', color: danger ? '#ef4444' : 'var(--text)',
                transition: 'background 0.15s', whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => e.currentTarget.style.background = danger ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.06)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
            <span style={{ color: danger ? '#ef4444' : 'var(--text-secondary)', display: 'flex' }}>{icon}</span>
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
            {shortcut && (
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{shortcut}</span>
            )}
            {trailing && (
                <span style={{ color: 'var(--text-secondary)', display: 'flex' }}>{trailing}</span>
            )}
        </div>
    )

    return (
        <>
            {/* Overlay mobile only */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed', inset: 0,
                    background: 'rgba(0,0,0,0.55)',
                    zIndex: 998,
                    opacity: (!isDesktop && isOpen) ? 1 : 0,
                    pointerEvents: (!isDesktop && isOpen) ? 'auto' : 'none',
                    transition: 'opacity 0.25s ease',
                }}
            />

            <div
                className="sidebar"
                style={{
                    position: 'fixed',
                    top: 0, left: 0, bottom: 0,
                    width: w,
                    background: 'var(--card)',
                    borderRight: '1px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 999,
                    transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1), width 0.25s cubic-bezier(0.4,0,0.2,1)',
                    transform: isOpen ? 'translateX(0)' : 'translateX(-110%)',
                    overflow: 'hidden',
                }}
            >
                {/* Header */}
                <div style={{
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isCollapsed ? 'center' : 'space-between',
                    minHeight: '56px',
                    padding: '0 12px',
                }}>
                    {!isCollapsed && (
                        <span style={{ fontWeight: '900', fontSize: '15px', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text)', whiteSpace: 'nowrap' }}>
                            Gym Planner AI
                        </span>
                    )}
                    <button
                        onClick={onToggleCollapse}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        style={{
                            background: 'transparent', border: 'none',
                            color: 'var(--text-secondary)', cursor: 'pointer',
                            padding: '8px', borderRadius: '8px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: '36px', height: '36px', flexShrink: 0,
                        }}
                    >
                        <PanelLeft size={18} strokeWidth={2} style={{ transform: isCollapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s' }} />
                    </button>
                </div>

                {/* Menu Items */}
                <div style={{ flex: 1, padding: isCollapsed ? '0.5rem 0' : '0.5rem 0.75rem', overflow: 'hidden' }}>
                    {menuItems.map((item) => {
                        const active = location.pathname === item.path
                        return (
                            <div
                                key={item.path}
                                onClick={() => handleNavigation(item.path)}
                                title={isCollapsed ? item.label : ''}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                                    gap: '12px',
                                    padding: isCollapsed ? '12px 0' : '11px 16px',
                                    borderRadius: isCollapsed ? '0' : '12px',
                                    marginBottom: '2px',
                                    cursor: 'pointer',
                                    background: active ? 'var(--accent-dim)' : 'transparent',
                                    color: active ? 'var(--accent)' : 'var(--text-secondary)',
                                    transition: 'all 0.15s',
                                    borderLeft: isCollapsed && active ? '2px solid var(--accent)' : isCollapsed ? '2px solid transparent' : 'none',
                                }}
                                onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--text)' } }}
                                onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' } }}
                            >
                                {item.icon}
                                {!isCollapsed && <span style={{ fontSize: '14px', fontWeight: '500', whiteSpace: 'nowrap' }}>{item.label}</span>}
                            </div>
                        )
                    })}
                </div>

                {/* User button + popup */}
                <div ref={userMenuRef} style={{ position: 'relative', borderTop: '1px solid var(--border)' }}>
                    {showUserMenu && (
                        <div style={{
                            position: 'absolute',
                            bottom: 'calc(100% + 6px)',
                            left: isCollapsed ? '8px' : '8px',
                            width: '280px',
                            background: 'var(--card2)',
                            border: '1px solid var(--border)',
                            borderRadius: '14px',
                            padding: '6px',
                            boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
                            zIndex: 1000,
                        }}>
                            {/* Email */}
                            <div style={{
                                padding: '12px 12px 8px',
                                fontSize: '13px',
                                color: 'var(--text-secondary)',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}>
                                {user?.email}
                            </div>

                            {renderRow({ icon: <Settings size={16} strokeWidth={2} />, label: 'Cài đặt', shortcut: '⇧Ctrl,' })}
                            {renderRow({ icon: <Globe size={16} strokeWidth={2} />, label: 'Ngôn ngữ', trailing: <ChevronRight size={14} strokeWidth={2} /> })}
                            {renderRow({ icon: <HelpCircle size={16} strokeWidth={2} />, label: 'Trợ giúp' })}

                            <div style={{ height: '1px', background: 'var(--border)', margin: '6px 8px' }} />

                            {renderRow({ icon: <ArrowUpCircle size={16} strokeWidth={2} />, label: 'Nâng cấp gói' })}
                            {renderRow({ icon: <Download size={16} strokeWidth={2} />, label: 'Ứng dụng & tiện ích' })}
                            {renderRow({ icon: <Info size={16} strokeWidth={2} />, label: 'Tìm hiểu thêm', trailing: <ChevronRight size={14} strokeWidth={2} /> })}

                            <div style={{ height: '1px', background: 'var(--border)', margin: '6px 8px' }} />

                            {renderRow({
                                icon: <LogOut size={16} strokeWidth={2} />,
                                label: 'Đăng xuất',
                                danger: true,
                                onClick: () => { setShowUserMenu(false); dangXuat() },
                            })}
                        </div>
                    )}

                    {/* User button */}
                    <div onClick={() => setShowUserMenu(prev => !prev)}
                        style={{
                            display: 'flex', alignItems: 'center',
                            justifyContent: isCollapsed ? 'center' : 'space-between',
                            padding: isCollapsed ? '12px 0' : '12px 14px',
                            cursor: 'pointer',
                            background: showUserMenu ? 'rgba(255,255,255,0.05)' : 'transparent',
                            transition: 'background 0.15s'
                        }}
                        onMouseEnter={e => { if (!showUserMenu) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                        onMouseLeave={e => { if (!showUserMenu) e.currentTarget.style.background = 'transparent' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                            <img
                                src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.email || 'User'}&background=00d4a0&color=000`}
                                alt="avatar"
                                style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #00d4a0', flexShrink: 0 }}
                            />
                            {!isCollapsed && (
                                <div style={{ overflow: 'hidden' }}>
                                    <div style={{ fontWeight: '600', fontSize: '13px', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {user?.displayName || user?.email?.split('@')[0] || 'User'}
                                    </div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Free plan</div>
                                </div>
                            )}
                        </div>
                        {!isCollapsed && (
                            <ChevronUp size={14} strokeWidth={2} style={{
                                color: 'var(--text-secondary)', flexShrink: 0,
                                transform: showUserMenu ? 'rotate(180deg)' : 'none',
                                transition: 'transform 0.2s'
                            }} />
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @media (min-width: 1025px) {
                    .sidebar {
                        transform: translateX(0) !important;
                    }
                }
            `}</style>
        </>
    )
}

export default Sidebar
