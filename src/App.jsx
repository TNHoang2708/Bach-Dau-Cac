import { Routes, Route, Link, useLocation } from 'react-router-dom'
import TrangChu from './pages/TrangChu'
import DinhDuong from './pages/DinhDuong'
import BMI from './pages/BMI'
import './App.css'

function App() {
  const location = useLocation()

  return (
    <div className="container">
      <div className="header">
        <h1>💪 Gym Planner AI</h1>
        <p>Nhập thông tin để nhận lịch tập cá nhân hóa bằng AI</p>
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
      </nav>

      <Routes>
        <Route path="/" element={<TrangChu />} />
        <Route path="/dinh-duong" element={<DinhDuong />} />
        <Route path="/bmi" element={<BMI />} />
      </Routes>
    </div>
  )
}

export default App