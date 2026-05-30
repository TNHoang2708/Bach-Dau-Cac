import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import TrangChu from './pages/TrangChu'
import DinhDuong from './pages/DinhDuong'
import BMI from './pages/BMI'
import DangNhap from './pages/DangNhap'
import NhatKy from './pages/NhatKy'
import LandingPage from './pages/LandingPage'
import { useAuth } from './context/AuthContext'
import { useState } from 'react'
import { Dumbbell, Salad, Scale, BookOpen } from 'lucide-react'
import './App.css'

function App() {
  const location = useLocation()
  const { user, dangXuat } = useAuth()
  const [showMenu, setShowMenu] = useState(false)
  const [showLogin, setShowLogin] = useState(false)

  // Chưa đăng nhập → Landing page hoặc trang đăng nhập
  if (!user) {
    if (showLogin) return <DangNhap />
    return <LandingPage onGetStarted={() => setShowLogin(true)} />
  }

  const navItems = [
    { to: '/', icon: <Dumbbell size={16} />, label: 'Lịch tập' },
    { to: '/dinh-duong', icon: <Salad size={16} />, label: 'Dinh dưỡng' },
    { to: '/bmi', icon: <Scale size={16} />, label: 'BMI' },
    { to: '/nhat-ky', icon: <BookOpen size={16} />, label: 'Nhật ký' },
  ]

  return (
    <div className="container">
      <div className="header" style={{ position: 'relative' }}>
        <h1>💪 Gym Planner AI</h1>
        <p>Nhập thông tin để nhận lịch tập cá nhân hóa bằng AI</p>

        <div style={{ position: 'absolute', top: 0, right: 0 }}>
          <img
            src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}&background=00d4a0&color=000`}
            alt="avatar"
            onClick={() => setShowMenu(!showMenu)}
            style={{
              width: '40px', height: '40px',
              borderRadius: '50%',
              cursor: 'pointer',
              border: '2px solid var(--accent)',
              objectFit: 'cover'
            }}
          />
          {showMenu && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '48px',
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '8px',
              minWidth: '200px',
              zIndex: 100,
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
            }}>
              <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', marginBottom: '8px' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>
                  {user.displayName || 'User'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{user.email}</div>
              </div>
              <button
                onClick={dangXuat}
                style={{
                  width: '100%', padding: '10px 12px',
                  background: 'rgba(239,68,68,0.1)',
                  color: '#ef4444',
                  fontSize: '14px',
                  textAlign: 'left',
                  borderRadius: '8px'
                }}
              >
                🚪 Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>

      <nav className="nav">
        {navItems.map(item => (
          <Link
            key={item.to}
            to={item.to}
            className={location.pathname === item.to ? 'active' : ''}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>

      <Routes>
        <Route path="/" element={<TrangChu />} />
        <Route path="/dinh-duong" element={<DinhDuong />} />
        <Route path="/bmi" element={<BMI />} />
        <Route path="/nhat-ky" element={<NhatKy />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  )
}

export default App