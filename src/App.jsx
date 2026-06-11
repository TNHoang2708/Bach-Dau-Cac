import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import TrangChu from './pages/TrangChu'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import DinhDuong from './pages/DinhDuong'
import BMI from './pages/BMI'
import DangNhap from './pages/DangNhap'
import NhatKy from './pages/NhatKy'
import LandingPage from './pages/LandingPage'
import Sidebar from './components/Sidebar'
import Onboarding from './pages/Onboarding'
import AICoachPage from './pages/AICoachPage'
import { useAuth } from './context/AuthContext'
import { useApp } from './context/AppContext'
import { useState, useEffect } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from './firebase'
import './App.css'
import Feedback from './pages/Feedback'

function AppLayout() {
  const { user } = useAuth()
  const { profileLoaded } = useApp()
  const navigate = useNavigate()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1024)
  const [onboardingDone, setOnboardingDone] = useState(null)

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth > 1024
      setIsDesktop(desktop)
      // khi resize về mobile thì auto collapse
      if (!desktop) setIsCollapsed(true)
      else setIsCollapsed(false)
    }
    window.addEventListener('resize', handleResize)
    // set initial state
    if (window.innerWidth <= 1024) setIsCollapsed(true)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!user || !profileLoaded) return
    const check = async () => {
      const localDone = localStorage.getItem(`onboarding_${user.uid}`)
      if (localDone) { setOnboardingDone(true); return }
      try {
        const snap = await getDoc(doc(db, 'users', user.uid, 'profile', 'info'))
        const done = snap.exists() && snap.data()?.onboardingCompleted === true
        setOnboardingDone(done)
      } catch {
        setOnboardingDone(false)
      }
    }
    check()
  }, [user, profileLoaded])

  if (!user) {
    return (
      <Routes>
        <Route path="/" element={
          <div style={{ margin: 0, padding: 0, width: '100%' }}>
            <LandingPage onGetStarted={() => navigate('/login')} />
          </div>
        } />
        <Route path="/login" element={<DangNhap />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    )
  }

  if (!profileLoaded) {
    return (
      <div style={{ minHeight: '100vh', background: '#09090b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '28px', height: '28px', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: '#e11d48', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!onboardingDone) {
    return <Onboarding onComplete={() => setOnboardingDone(true)} />
  }

  const sidebarWidth = isCollapsed ? 64 : 280

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(prev => !prev)}
      />
      <div style={{
        flex: 1,
        marginLeft: `${sidebarWidth}px`,
        transition: 'margin-left 0.25s cubic-bezier(0.4,0,0.2,1)',
        minWidth: 0,
      }}>
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
          <Routes>
            <Route path="/" element={<TrangChu />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/dinh-duong" element={<DinhDuong />} />
            <Route path="/bmi" element={<BMI />} />
            <Route path="/nhat-ky" element={<NhatKy />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/ai-coach" element={<AICoachPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return <AppLayout />
}
