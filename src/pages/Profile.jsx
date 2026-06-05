import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { User, Ruler, Weight, Calendar, Activity, Heart, Target, CheckCircle } from 'lucide-react'

const MUC_TIEU_OPTIONS = ['Tăng cơ', 'Giảm mỡ', 'Tăng cơ/Giảm mỡ', 'Tăng sức bền']
const KINH_NGHIEM_OPTIONS = ['Chưa từng tập', 'Dưới 1 năm', '1-3 năm', 'Trên 3 năm']
const BENH_LY_OPTIONS = ['Không có', 'Huyết áp cao', 'Tiểu đường', 'Đau khớp', 'Tim mạch', 'Khác']

function tinhBMI(canNang, chieuCao) {
    const kg = parseFloat(canNang)
    const cm = parseFloat(chieuCao)
    if (!kg || !cm) return null
    const bmi = kg / ((cm / 100) ** 2)
    return bmi.toFixed(1)
}

function phanLoaiBMI(bmi) {
    if (!bmi) return null
    const b = parseFloat(bmi)
    if (b < 18.5) return { label: 'Thiếu cân', color: '#60a5fa' }
    if (b < 23) return { label: 'Bình thường', color: '#00d4a0' }
    if (b < 25) return { label: 'Thừa cân nhẹ', color: '#f59e0b' }
    if (b < 30) return { label: 'Thừa cân', color: '#f97316' }
    return { label: 'Béo phì', color: '#ef4444' }
}

function tinhTDEE(canNang, chieuCao, tuoi, mucTieu) {
    const kg = parseFloat(canNang)
    const cm = parseFloat(chieuCao)
    const age = parseInt(tuoi)
    if (!kg || !cm || !age) return null
    const bmr = 10 * kg + 6.25 * cm - 5 * age + 5
    const tdee = Math.round(bmr * 1.55)
    if (mucTieu === 'Tăng cơ') return tdee + 300
    if (mucTieu === 'Giảm mỡ') return tdee - 400
    return tdee
}

function Profile() {
    const { user } = useAuth()
    const {
        tuoi, setTuoi,
        canNang, setCanNang,
        chieuCao, setChieuCao,
        kinhNghiem, setKinhNghiem,
        benhLy, setBenhLy,
        mucTieu, setMucTieu,
    } = useApp()

    const [saved, setSaved] = useState(false)

    const bmi = tinhBMI(canNang, chieuCao)
    const bmiInfo = phanLoaiBMI(bmi)
    const tdee = tinhTDEE(canNang, chieuCao, tuoi, mucTieu)

    const handleSave = () => {
        // AppContext auto-save rồi, chỉ cần show feedback
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
    }

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ color: 'var(--text)', fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>
                    Hồ sơ cá nhân
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                    Thông tin được lưu tự động
                </p>
            </div>

            {/* Avatar + tên */}
            <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '16px' }}>
                {user?.photoURL
                    ? <img src={user.photoURL} alt="avatar" style={{ width: '64px', height: '64px', borderRadius: '50%', border: '2px solid var(--accent)', objectFit: 'cover' }} />
                    : <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={28} color="#000" />
                    </div>
                }
                <div>
                    <div style={{ fontWeight: 700, fontSize: '18px', color: 'var(--text)' }}>
                        {user?.displayName || 'Người dùng'}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {user?.email}
                    </div>
                    <div style={{
                        marginTop: '6px', display: 'inline-block',
                        background: 'var(--accent-dim)', border: '1px solid var(--accent)',
                        borderRadius: '20px', padding: '2px 10px',
                        fontSize: '12px', color: 'var(--accent)'
                    }}>
                        {mucTieu}
                    </div>
                </div>
            </div>

            {/* Stats nhanh */}
            {(bmi || tdee) && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '1.5rem' }}>
                    {bmi && (
                        <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
                            <div style={{ fontSize: '28px', fontWeight: 800, color: bmiInfo?.color }}>{bmi}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>BMI</div>
                            <div style={{ fontSize: '12px', color: bmiInfo?.color, marginTop: '4px', fontWeight: 600 }}>{bmiInfo?.label}</div>
                        </div>
                    )}
                    {tdee && (
                        <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
                            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--accent)' }}>{tdee}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>Calo/ngày</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Mục tiêu</div>
                        </div>
                    )}
                    {canNang && chieuCao && (
                        <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
                            <div style={{ fontSize: '28px', fontWeight: 800, color: '#60a5fa' }}>
                                {Math.round(22 * ((parseFloat(chieuCao) / 100) ** 2))}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>Cân lý tưởng</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>kg (BMI 22)</div>
                        </div>
                    )}
                </div>
            )}

            {/* Form thông tin */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
                    <User size={14} /> Thông tin cơ thể
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '1rem' }}>
                    <div>
                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                            <Calendar size={12} /> Tuổi
                        </label>
                        <input
                            type="number"
                            value={tuoi}
                            onChange={e => setTuoi(e.target.value)}
                            placeholder="20"
                            min="10" max="100"
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                            <Weight size={12} /> Cân nặng (kg)
                        </label>
                        <input
                            type="number"
                            value={canNang}
                            onChange={e => setCanNang(e.target.value)}
                            placeholder="70"
                            min="30" max="200"
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                            <Ruler size={12} /> Chiều cao (cm)
                        </label>
                        <input
                            type="number"
                            value={chieuCao}
                            onChange={e => setChieuCao(e.target.value)}
                            placeholder="170"
                            min="100" max="250"
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                            <Activity size={12} /> Kinh nghiệm tập luyện
                        </label>
                        <select value={kinhNghiem} onChange={e => setKinhNghiem(e.target.value)}>
                            {KINH_NGHIEM_OPTIONS.map(o => <option key={o}>{o}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                            <Heart size={12} /> Tình trạng sức khỏe
                        </label>
                        <select value={benhLy} onChange={e => setBenhLy(e.target.value)}>
                            {BENH_LY_OPTIONS.map(o => <option key={o}>{o}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Mục tiêu */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
                    <Target size={14} /> Mục tiêu tập luyện
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                    {MUC_TIEU_OPTIONS.map(option => (
                        <div
                            key={option}
                            onClick={() => setMucTieu(option)}
                            style={{
                                padding: '14px',
                                borderRadius: '12px',
                                border: `1px solid ${mucTieu === option ? 'var(--accent)' : 'var(--border)'}`,
                                background: mucTieu === option ? 'var(--accent-dim)' : 'var(--card2)',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '14px',
                                fontWeight: mucTieu === option ? 600 : 400,
                                color: mucTieu === option ? 'var(--accent)' : 'var(--text)',
                            }}
                        >
                            <div style={{
                                width: '18px', height: '18px', borderRadius: '50%',
                                border: `2px solid ${mucTieu === option ? 'var(--accent)' : 'var(--border)'}`,
                                background: mucTieu === option ? 'var(--accent)' : 'transparent',
                                flexShrink: 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                {mucTieu === option && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#000' }} />}
                            </div>
                            {option}
                        </div>
                    ))}
                </div>
            </div>

            {/* Save button */}
            <button
                onClick={handleSave}
                style={{
                    width: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    background: saved ? 'transparent' : 'var(--accent)',
                    color: saved ? 'var(--accent)' : '#000',
                    border: saved ? '1px solid var(--accent)' : 'none',
                    transition: 'all 0.3s',
                    fontWeight: 700,
                }}
            >
                {saved ? <><CheckCircle size={16} /> Đã lưu!</> : 'Lưu thông tin'}
            </button>
        </div>
    )
}

export default Profile
