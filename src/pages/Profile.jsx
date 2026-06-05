import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { User } from 'lucide-react'

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
    if (b < 23) return { label: 'Bình thường', color: 'var(--accent)' }
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

    const bmi = tinhBMI(canNang, chieuCao)
    const bmiInfo = phanLoaiBMI(bmi)
    const tdee = tinhTDEE(canNang, chieuCao, tuoi, mucTieu)

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
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div className="card-title">
                    Thống kê cá nhân
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3,1fr)',
                        gap: '12px'
                    }}
                >
                    <div
                        style={{
                            background: 'var(--card2)',
                            padding: '16px',
                            borderRadius: '12px',
                            textAlign: 'center'
                        }}
                    >
                        <div
                            style={{
                                fontSize: '26px',
                                fontWeight: 700,
                                color: 'var(--accent)'
                            }}
                        >
                            12
                        </div>

                        <div style={{ color: 'var(--text-secondary)' }}>
                            Lịch tập đã tạo
                        </div>
                    </div>

                    <div
                        style={{
                            background: 'var(--card2)',
                            padding: '16px',
                            borderRadius: '12px',
                            textAlign: 'center'
                        }}
                    >
                        <div
                            style={{
                                fontSize: '26px',
                                fontWeight: 700,
                                color: '#60a5fa'
                            }}
                        >
                            35
                        </div>

                        <div style={{ color: 'var(--text-secondary)' }}>
                            Bữa ăn phân tích
                        </div>
                    </div>

                    <div
                        style={{
                            background: 'var(--card2)',
                            padding: '16px',
                            borderRadius: '12px',
                            textAlign: 'center'
                        }}
                    >
                        <div
                            style={{
                                fontSize: '26px',
                                fontWeight: 700,
                                color: '#f59e0b'
                            }}
                        >
                            18
                        </div>

                        <div style={{ color: 'var(--text-secondary)' }}>
                            Ngày hoạt động
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default Profile
