import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import TrangChu from './pages/TrangChu'
import DinhDuong from './pages/DinhDuong'
import BMI from './pages/BMI'
import DangNhap from './pages/DangNhap'
import NhatKy from './pages/NhatKy'
import LandingPage from './pages/LandingPage'
import Sidebar from './components/Sidebar'
import { useAuth } from './context/AuthContext'
import { useState, useEffect } from 'react'
import { Menu } from 'lucide-react'
import './App.css'

function App() {
  const location = useLocation()
  const { user } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1024)

  // Lắng nghe resize để tự động đóng sidebar khi kéo to lên
  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth > 1024
      setIsDesktop(desktop)
      // Nếu đang là desktop, đóng mobile menu
      if (desktop && mobileMenuOpen) {
        setMobileMenuOpen(false)
      }
      // Nếu đang là mobile và sidebar đang mở nhưng kéo to quá breakpoint thì đóng
      if (!desktop && mobileMenuOpen && window.innerWidth > 1024) {
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [mobileMenuOpen])

  // Chưa đăng nhập → Landing page hoặc trang đăng nhập
  if (!user) {
    if (showLogin) return <DangNhap onBack={() => setShowLogin(false)} />
    return (
      <div style={{ margin: 0, padding: 0, width: '100%' }}>
        <LandingPage onGetStarted={() => setShowLogin(true)} />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Nút menu cho mobile - chỉ hiện khi không phải desktop */}
      {!isDesktop && (
        <button
          onClick={() => setMobileMenuOpen(true)}
          style={{
            position: 'fixed',
            top: '1rem',
            left: '1rem',
            zIndex: 100,
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'var(--card)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
          className="menu-toggle"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Main Content */}
      <div className="main-content" style={{
        flex: 1,
        padding: '2rem',
      }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Routes>
            <Route path="/" element={<TrangChu />} />
            <Route path="/dinh-duong" element={<DinhDuong />} />
            <Route path="/bmi" element={<BMI />} />
            <Route path="/nhat-ky" element={<NhatKy />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>

      <style>{`
        /* DESKTOP (> 1024px): Sidebar luôn hiện */
        @media (min-width: 1025px) {
          .sidebar {
            transform: translateX(0) !important;
          }
          .main-content {
            margin-left: 280px !important;
            width: calc(100% - 280px) !important;
          }
        }

        /* TABLET (769px - 1024px): Sidebar luôn hiện, có nút X */
        @media (min-width: 769px) and (max-width: 1024px) {
          .sidebar {
            transform: translateX(0) !important;
          }
          .main-content {
            margin-left: 280px !important;
            width: calc(100% - 280px) !important;
          }
        }

        /* MOBILE (<= 768px): Sidebar ẩn mặc định */
        @media (max-width: 768px) {
          .sidebar {
            transform: translateX(-100%) !important;
          }
          .sidebar.open {
            transform: translateX(0) !important;
          }
          .main-content {
            margin-left: 0 !important;
            width: 100% !important;
            padding: 1rem !important;
          }
        }
      `}</style>
    </div>
  )
}

export default App