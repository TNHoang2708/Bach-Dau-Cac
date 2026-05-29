import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import TrangChu from './pages/TrangChu'
import DinhDuong from './pages/DinhDuong'
import BMI from './pages/BMI'
import DangNhap from './pages/DangNhap'
import NhatKy from './pages/NhatKy'
import { useAuth } from './context/AuthContext'
import './App.css'

function App() {
  const location = useLocation()
  const { user, dangXuat } = useAuth()

  if (!user) return <DangNhap />

  return (
    <div className="container">
      <div className="header">
        <h1>💪 Gym Planner AI</h1>
        <p>Xin chào, {user.email} 👋</p>
      </div>

      <nav className="nav">
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
          🏋️ Lịch tập
        </Link>
        <Link to="/dinh-duong" className={location.pathname === '/dinh-duong' ? 'active' : ''}>
          🥗 Dinh dưỡng
        </Link>
        <Link to="/bmi" className={location.pathname === '/bmi' ? 'active' : ''}>
          ⚖️ BMI
        </Link>
        <Link to="/nhat-ky" className={location.pathname === '/nhat-ky' ? 'active' : ''}>
          📝 Nhật ký
        </Link>
        <button
          onClick={dangXuat}
          style={{
            width: 'auto',
            padding: '10px 20px',
            fontSize: '14px',
            background: 'transparent',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
            marginLeft: 'auto'
          }}
        >
          🚪 Đăng xuất
        </button>
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