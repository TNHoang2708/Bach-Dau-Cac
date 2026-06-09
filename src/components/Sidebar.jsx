import { Home, Salad, Scale, BookOpen, LogOut, PanelLeft, Settings, HelpCircle, ChevronUp, Globe, ArrowUpCircle, Download, Info, ChevronRight, LayoutDashboard, UserCircle, MessageSquare } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useRef, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'

function Sidebar({ isOpen, isCollapsed, isDesktop, onToggleCollapse, onClose }) {
    const { user, dangXuat } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [showHelp, setShowHelp] = useState(false)
    const [showSettings, setShowSettings] = useState(false)
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('theme') !== 'light'
    })
    const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'vi')
    const [notify, setNotify] = useState(true)
    const { t, i18n } = useTranslation()

    const menuGroups = useMemo(() => [
        {
            items: [
                { path: '/', icon: <Home size={20} strokeWidth={2} />, label: t('lichTap') },
                { path: '/dinh-duong', icon: <Salad size={20} strokeWidth={2} />, label: t('dinhDuong') },
            ]
        },
        {
            items: [
                { path: '/nhat-ky', icon: <BookOpen size={20} strokeWidth={2} />, label: t('nhatKy') },
                { path: '/bmi', icon: <Scale size={20} strokeWidth={2} />, label: 'BMI' },
            ]
        },
        {
            items: [
                { path: '/dashboard', icon: <LayoutDashboard size={20} strokeWidth={2} />, label: 'Dashboard' },
            ]
        },
        {
            items: [
                { path: '/profile', icon: <UserCircle size={20} strokeWidth={2} />, label: t('hoSo') },
                { path: '/feedback', icon: <MessageSquare size={20} strokeWidth={2} />, label: 'Feedback' },
            ]
        },
    ], [t, i18n.language])
    const menuItems = menuGroups.flatMap(g => g.items)

    const [showUserMenu, setShowUserMenu] = useState(false)
    const userMenuRef = useRef(null)
    useEffect(() => {
        if (darkMode) {
            document.body.classList.remove('light-mode')
            localStorage.setItem('theme', 'dark')
        } else {
            document.body.classList.add('light-mode')
            localStorage.setItem('theme', 'light')
        }
    }, [darkMode])
    useEffect(() => {
        localStorage.setItem('language', language)
        i18n.changeLanguage(language)
    }, [language])
    useEffect(() => {
        const handle = (e) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target) && !showHelp) {
                setShowUserMenu(false)
            }
        }
        document.addEventListener('mousedown', handle)
        return () => document.removeEventListener('mousedown', handle)
    }, [showHelp])

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
                key={i18n.language}
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
                    {menuGroups.map((group, gi) => (
                        <div key={gi}>
                            {gi > 0 && <div style={{ height: '1px', background: 'var(--border)', margin: isCollapsed ? '6px 0' : '6px 8px' }} />}
                            {group.items.map((item) => {
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
                    ))}
                </div>

                {/* User button + popup */}
                <div ref={userMenuRef} style={{ position: 'relative', borderTop: '1px solid var(--border)' }}>
                    {showUserMenu && createPortal(
                        <div style={{
                            position: 'fixed',
                            bottom: '70px',
                            left: isCollapsed ? '8px' : '8px',
                            width: isCollapsed ? '220px' : '240px',
                            background: '#2a2a2a',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '20px',
                            padding: '8px',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                            zIndex: 9999,
                        }}>
                            {/* Header: avatar + tên */}
                            <div
                                onClick={() => { setShowUserMenu(false); window.location.href = '/profile' }}
                                style={{
                                    display: 'flex', alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '10px 14px 14px',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    transition: 'background 0.15s',
                                    marginBottom: '2px',
                                    borderBottom: '1px solid rgba(255,255,255,0.07)',
                                    paddingBottom: '14px',
                                    marginBottom: '6px',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                                    {user?.photoURL
                                        ? <img src={user.photoURL} alt="avatar" style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                                        : <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 700, color: '#000', flexShrink: 0 }}>
                                            {(user?.displayName || user?.email || 'U')[0].toUpperCase()}
                                        </div>
                                    }
                                    <div style={{ overflow: 'hidden' }}>
                                        <div style={{ fontWeight: 600, fontSize: '15px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {user?.displayName || user?.email?.split('@')[0] || 'User'}
                                        </div>
                                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginTop: '2px' }}>Free</div>
                                    </div>
                                </div>
                                <ChevronRight size={16} strokeWidth={2} style={{ color: 'rgba(255,255,255,0.4)', flexShrink: 0 }} />
                            </div>

                            <div
                                onMouseDown={(e) => { e.stopPropagation(); setShowUserMenu(false); setShowSettings(true) }}
                                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: 'var(--text)', transition: 'background 0.15s' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <span style={{ color: 'var(--text-secondary)', display: 'flex' }}><Settings size={16} strokeWidth={2} /></span>
                                <span style={{ flex: 1 }}>{t('caiDat')}</span>
                                <span style={{ color: 'var(--text-secondary)', display: 'flex' }}><ChevronRight size={14} strokeWidth={2} /></span>
                            </div>
                            <div
                                onMouseDown={(e) => { e.stopPropagation(); setShowUserMenu(false); setShowHelp(true) }}
                                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: 'var(--text)', transition: 'background 0.15s' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <span style={{ color: 'var(--text-secondary)', display: 'flex' }}><HelpCircle size={16} strokeWidth={2} /></span>
                                <span style={{ flex: 1 }}>{t('troGiup')}</span>
                                <span style={{ color: 'var(--text-secondary)', display: 'flex' }}><ChevronRight size={14} strokeWidth={2} /></span>
                            </div>

                            <div style={{ height: '1px', background: 'var(--border)', margin: '4px 4px' }} />

                            <div
                                onMouseDown={(e) => { e.stopPropagation(); setShowUserMenu(false); dangXuat() }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '12px',
                                    padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
                                    fontSize: '14px', color: '#ef4444',
                                    transition: 'background 0.15s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <span style={{ color: '#ef4444', display: 'flex' }}><LogOut size={16} strokeWidth={2} /></span>
                                <span>{t('dangXuat')}</span>
                            </div>
                        </div>
                        , document.body)}{showHelp && createPortal(
                            <div style={{
                                position: 'fixed', inset: 0,
                                background: 'rgba(0,0,0,0.6)',
                                zIndex: 10000,
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }} onClick={() => setShowHelp(false)}>
                                <div onClick={e => e.stopPropagation()} style={{
                                    background: '#1a1a1a',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '20px',
                                    padding: '2rem',
                                    width: '90%', maxWidth: '520px',
                                    maxHeight: '80vh', overflowY: 'auto'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#fff' }}>Trợ giúp</h2>
                                        <div onClick={() => setShowHelp(false)} style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: '4px' }}>✕</div>
                                    </div>

                                    {[
                                        { icon: '🏋️', title: 'Lịch tập AI', desc: 'Nhập thông tin cơ bản (tuổi, cân nặng, chiều cao, mục tiêu) rồi nhấn "Tạo lịch tập ngay" để AI tạo lịch tập cá nhân hóa cho bạn.' },
                                        { icon: '🥗', title: 'Phân tích dinh dưỡng', desc: 'Chụp hoặc tải ảnh bữa ăn lên, nhấn "Phân tích dinh dưỡng" để AI phân tích calo và dinh dưỡng ngay lập tức.' },
                                        { icon: '⚖️', title: 'Tính chỉ số BMI', desc: 'Nhập cân nặng, chiều cao, tuổi và giới tính để tính BMI, cân nặng lý tưởng và lượng calo cần thiết mỗi ngày.' },
                                        { icon: '📝', title: 'Nhật ký tập luyện', desc: 'Ghi lại từng buổi tập với ngày, bài tập, số sets, reps và kg. Dữ liệu được lưu trên cloud.' },
                                        { icon: '💬', title: 'Feedback', desc: 'Đánh giá sao, báo lỗi hoặc góp ý tính năng mới. Đánh giá 4-5 sao sẽ hiện lên trang chủ.' },
                                    ].map((item, i) => (
                                        <div key={i} style={{
                                            display: 'flex', gap: '14px',
                                            padding: '14px 0',
                                            borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.06)' : 'none'
                                        }}>
                                            <div style={{ fontSize: '24px', flexShrink: 0 }}>{item.icon}</div>
                                            <div>
                                                <div style={{ fontWeight: '700', fontSize: '15px', color: '#fff', marginBottom: '6px' }}>{item.title}</div>
                                                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{item.desc}</div>
                                            </div>
                                        </div>
                                    ))}

                                    <button onClick={() => setShowHelp(false)} style={{
                                        width: '100%', marginTop: '1.5rem', padding: '12px',
                                        background: 'var(--accent)', color: '#000',
                                        fontWeight: '700', borderRadius: '10px', fontSize: '14px'
                                    }}>
                                        Đã hiểu!
                                    </button>
                                </div>
                            </div>
                            , document.body)}
                    {showSettings && createPortal(
                        <div style={{
                            position: 'fixed', inset: 0,
                            background: 'rgba(0,0,0,0.6)',
                            zIndex: 10000,
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }} onClick={() => setShowSettings(false)}>
                            <div onClick={e => e.stopPropagation()} style={{
                                background: '#1a1a1a',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '20px',
                                padding: '2rem',
                                width: '90%', maxWidth: '480px',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#fff' }}>Cài đặt</h2>
                                    <div onClick={() => setShowSettings(false)} style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: '4px' }}>✕</div>
                                </div>

                                {/* Giao diện */}
                                <div style={{ marginBottom: '1.25rem', paddingBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                    <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', marginBottom: '12px' }}>Giao diện</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>Chế độ tối</div>
                                            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>Bật/tắt dark mode</div>
                                        </div>
                                        <div onClick={() => setDarkMode(!darkMode)} style={{
                                            width: '44px', height: '24px', borderRadius: '99px',
                                            background: darkMode ? 'var(--accent)' : 'rgba(255,255,255,0.15)',
                                            cursor: 'pointer', position: 'relative', transition: 'background 0.2s'
                                        }}>
                                            <div style={{
                                                position: 'absolute', top: '3px',
                                                left: darkMode ? '23px' : '3px',
                                                width: '18px', height: '18px',
                                                borderRadius: '50%', background: '#fff',
                                                transition: 'left 0.2s'
                                            }} />
                                        </div>
                                    </div>
                                </div>

                                {/* Ngôn ngữ */}
                                <div style={{ marginBottom: '1.25rem', paddingBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                    <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', marginBottom: '12px' }}>Ngôn ngữ</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                        {[{ val: 'vi', label: '🇻🇳 Tiếng Việt' }, { val: 'en', label: '🇺🇸 English' }].map(l => (
                                            <div key={l.val} onClick={() => setLanguage(l.val)} style={{
                                                padding: '10px 14px', borderRadius: '10px', cursor: 'pointer',
                                                border: `1px solid ${language === l.val ? 'var(--accent)' : 'rgba(255,255,255,0.08)'}`,
                                                background: language === l.val ? 'rgba(0,212,160,0.1)' : 'transparent',
                                                fontSize: '13px', fontWeight: '600',
                                                color: language === l.val ? 'var(--accent)' : 'rgba(255,255,255,0.6)',
                                                transition: 'all 0.2s'
                                            }}>{l.label}</div>
                                        ))}
                                    </div>
                                </div>

                                {/* Thông báo */}
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', marginBottom: '12px' }}>Thông báo</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>Nhận thông báo</div>
                                            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>Nhắc nhở tập luyện hàng ngày</div>
                                        </div>
                                        <div onClick={() => setNotify(!notify)} style={{
                                            width: '44px', height: '24px', borderRadius: '99px',
                                            background: notify ? 'var(--accent)' : 'rgba(255,255,255,0.15)',
                                            cursor: 'pointer', position: 'relative', transition: 'background 0.2s'
                                        }}>
                                            <div style={{
                                                position: 'absolute', top: '3px',
                                                left: notify ? '23px' : '3px',
                                                width: '18px', height: '18px',
                                                borderRadius: '50%', background: '#fff',
                                                transition: 'left 0.2s'
                                            }} />
                                        </div>
                                    </div>
                                </div>

                                <button onClick={() => setShowSettings(false)} style={{
                                    width: '100%', padding: '12px',
                                    background: 'var(--accent)', color: '#000',
                                    fontWeight: '700', borderRadius: '10px', fontSize: '14px'
                                }}>
                                    Lưu cài đặt
                                </button>
                            </div>
                        </div>
                        , document.body)}

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
                                src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.email || 'User'}&background=3b82f6&color=000`}
                                alt="avatar"
                                style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent)', flexShrink: 0 }}
                            />
                            {!isCollapsed && (
                                <div style={{ overflow: 'hidden' }}>
                                    <div style={{ fontWeight: '600', fontSize: '13px', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {user?.displayName || user?.email?.split('@')[0] || 'User'}
                                    </div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{t('freePlan')}</div>
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
