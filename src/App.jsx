import { Routes, Route, Navigate } from 'react-router-dom'
import TrangChu from './pages/TrangChu'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import DinhDuong from './pages/DinhDuong'
import BMI from './pages/BMI'
import DangNhap from './pages/DangNhap'
import NhatKy from './pages/NhatKy'
import LandingPage from './pages/LandingPage'
import Sidebar from './components/Sidebar'
import ChatBox from './components/ChatBox'
import { useAuth } from './context/AuthContext'
import { useState, useEffect } from 'react'
import './App.css'
import Feedback from './pages/Feedback'

function App() {
  const { user } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false) // chỉ dùng cho mobile
  const [showLogin, setShowLogin] = useState(false)
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1024)

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth > 1024
      setIsDesktop(desktop)
      if (!desktop) setSidebarOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (!user) {
    if (showLogin) return <DangNhap onBack={() => setShowLogin(false)} />
    return (
      <div style={{ margin: 0, padding: 0, width: '100%' }}>
        <LandingPage onGetStarted={() => setShowLogin(true)} />
      </div>
    )
  }

  const sidebarWidth = isDesktop ? (isCollapsed ? 64 : 280) : 0

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        isOpen={isDesktop ? true : sidebarOpen}
        isCollapsed={isDesktop ? isCollapsed : false}
        isDesktop={isDesktop}
        onToggleCollapse={() => setIsCollapsed(prev => !prev)}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div
        className="main-content"
        style={{
          flex: 1,
          marginLeft: `${sidebarWidth}px`,
          transition: 'margin-left 0.25s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '2rem',
          }}
        >
          <Routes>
            <Route path="/" element={<TrangChu />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/dinh-duong" element={<DinhDuong />} />
            <Route path="/bmi" element={<BMI />} />
            <Route path="/nhat-ky" element={<NhatKy />} />
            <Route path="*" element={<Navigate to="/" />} />
            <Route path="/feedback" element={<Feedback />} />
          </Routes>
        </div>
      </div>

      {/* Floating AI ChatBox */}
      {user && <ChatBox />}

      <style>{`
        @media (max-width: 768px) {
          .main-content {
            margin-left: 0 !important;
            padding: 1rem !important;
          }
        }
      `}</style>
    </div>
  )
}

export default App
