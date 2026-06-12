import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { useFood } from '../context/FoodContext'
import { db } from '../firebase'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { User, Pencil, Check, X } from 'lucide-react'

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
    const { foodLog } = useFood()

    const [workoutLogs, setWorkoutLogs] = useState([])
    const [statsLoading, setStatsLoading] = useState(true)

    // --- Form chỉnh sửa thông tin ---
    const [editing, setEditing] = useState(false)
    const [form, setForm] = useState({
        tuoi: '', canNang: '', chieuCao: '', mucTieu: MUC_TIEU_OPTIONS[0],
        kinhNghiem: KINH_NGHIEM_OPTIONS[0], benhLy: BENH_LY_OPTIONS[0],
    })

    useEffect(() => {
        if (!editing) {
            setForm({
                tuoi: tuoi || '',
                canNang: canNang || '',
                chieuCao: chieuCao || '',
                mucTieu: mucTieu || MUC_TIEU_OPTIONS[0],
                kinhNghiem: kinhNghiem || KINH_NGHIEM_OPTIONS[0],
                benhLy: benhLy || BENH_LY_OPTIONS[0],
            })
        }
    }, [tuoi, canNang, chieuCao, mucTieu, kinhNghiem, benhLy, editing])

    const startEdit = () => setEditing(true)
    const cancelEdit = () => setEditing(false)

    const saveEdit = () => {
        // Mỗi setter đã tự động lưu lên Firestore (cả field cũ + hardMemory/softMemory)
        if (form.tuoi !== tuoi) setTuoi(form.tuoi)
        if (form.canNang !== canNang) setCanNang(form.canNang)
        if (form.chieuCao !== chieuCao) setChieuCao(form.chieuCao)
        if (form.mucTieu !== mucTieu) setMucTieu(form.mucTieu)
        if (form.kinhNghiem !== kinhNghiem) setKinhNghiem(form.kinhNghiem)
        if (form.benhLy !== benhLy) setBenhLy(form.benhLy)
        setEditing(false)
    }

    useEffect(() => {
        if (!user) {
            setWorkoutLogs([])
            setStatsLoading(false)
            return
        }
        const q = query(collection(db, 'users', user.uid, 'nhatky'), orderBy('ngay', 'desc'))
        const unsub = onSnapshot(q, (snap) => {
            setWorkoutLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })))
            setStatsLoading(false)
        }, (e) => {
            console.error('Load nhatky error:', e)
            setStatsLoading(false)
        })
        return () => unsub()
    }, [user])

    const soBuoiTap = workoutLogs.length
    const soBuaAn = foodLog.length

    const soNgayHoatDong = (() => {
        const days = new Set()
        workoutLogs.forEach(w => {
            if (w.ngay) days.add(new Date(w.ngay).toDateString())
        })
        foodLog.forEach(m => {
            if (m._jsDate instanceof Date) days.add(m._jsDate.toDateString())
        })
        return days.size
    })()

    const bmi = tinhBMI(canNang, chieuCao)
    const bmiInfo = phanLoaiBMI(bmi)
    const tdee = tinhTDEE(canNang, chieuCao, tuoi, mucTieu)

    const inputStyle = {
        width: '100%', padding: '10px 12px', fontSize: '14px',
        background: 'var(--card2)', border: '1px solid var(--border)',
        borderRadius: '8px', color: 'var(--text)', outline: 'none',
    }
    const labelStyle = { fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }
    const fieldWrap = { marginBottom: '14px' }

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

            {/* Thông tin cá nhân - có thể chỉnh sửa */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div className="card-title" style={{ margin: 0 }}>Thông tin cá nhân</div>
                    {!editing ? (
                        <button
                            onClick={startEdit}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                width: 'auto', padding: '6px 12px', fontSize: '12px',
                                background: 'var(--card2)', border: '1px solid var(--border)',
                                borderRadius: '8px', color: 'var(--text-secondary)', cursor: 'pointer',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
                        >
                            <Pencil size={13} /> Chỉnh sửa
                        </button>
                    ) : (
                        <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                                onClick={cancelEdit}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '4px',
                                    width: 'auto', padding: '6px 12px', fontSize: '12px',
                                    background: 'var(--card2)', border: '1px solid var(--border)',
                                    borderRadius: '8px', color: 'var(--text-secondary)', cursor: 'pointer',
                                }}
                            >
                                <X size={13} /> Hủy
                            </button>
                            <button
                                onClick={saveEdit}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '4px',
                                    width: 'auto', padding: '6px 12px', fontSize: '12px',
                                    background: 'var(--accent)', border: 'none',
                                    borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: 600,
                                }}
                            >
                                <Check size={13} /> Lưu
                            </button>
                        </div>
                    )}
                </div>

                {!editing ? (
                    // --- Hiển thị thông tin ---
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                        {[
                            { label: 'Tuổi', value: tuoi || '—' },
                            { label: 'Cân nặng', value: canNang ? `${canNang} kg` : '—' },
                            { label: 'Chiều cao', value: chieuCao ? `${chieuCao} cm` : '—' },
                            { label: 'Mục tiêu', value: mucTieu || '—' },
                            { label: 'Kinh nghiệm', value: kinhNghiem || '—' },
                            { label: 'Bệnh lý', value: benhLy || '—' },
                        ].map(f => (
                            <div key={f.label} style={{ background: 'var(--card2)', padding: '12px', borderRadius: '10px' }}>
                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>{f.label}</div>
                                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)' }}>{f.value}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    // --- Form chỉnh sửa ---
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0 16px' }}>
                        <div style={fieldWrap}>
                            <label style={labelStyle}>Tuổi</label>
                            <input
                                type="number" style={inputStyle} value={form.tuoi}
                                onChange={e => setForm(f => ({ ...f, tuoi: e.target.value }))}
                                placeholder="VD: 22"
                            />
                        </div>
                        <div style={fieldWrap}>
                            <label style={labelStyle}>Cân nặng (kg)</label>
                            <input
                                type="number" style={inputStyle} value={form.canNang}
                                onChange={e => setForm(f => ({ ...f, canNang: e.target.value }))}
                                placeholder="VD: 70"
                            />
                        </div>
                        <div style={fieldWrap}>
                            <label style={labelStyle}>Chiều cao (cm)</label>
                            <input
                                type="number" style={inputStyle} value={form.chieuCao}
                                onChange={e => setForm(f => ({ ...f, chieuCao: e.target.value }))}
                                placeholder="VD: 175"
                            />
                        </div>
                        <div style={fieldWrap}>
                            <label style={labelStyle}>Mục tiêu</label>
                            <select
                                style={inputStyle} value={form.mucTieu}
                                onChange={e => setForm(f => ({ ...f, mucTieu: e.target.value }))}
                            >
                                {MUC_TIEU_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                        </div>
                        <div style={fieldWrap}>
                            <label style={labelStyle}>Kinh nghiệm</label>
                            <select
                                style={inputStyle} value={form.kinhNghiem}
                                onChange={e => setForm(f => ({ ...f, kinhNghiem: e.target.value }))}
                            >
                                {KINH_NGHIEM_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                        </div>
                        <div style={fieldWrap}>
                            <label style={labelStyle}>Bệnh lý</label>
                            <select
                                style={inputStyle} value={form.benhLy}
                                onChange={e => setForm(f => ({ ...f, benhLy: e.target.value }))}
                            >
                                {BENH_LY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* Thống kê cá nhân */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div className="card-title">Thống kê cá nhân</div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
                    <div style={{ background: 'var(--card2)', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '26px', fontWeight: 700, color: 'var(--accent)' }}>
                            {statsLoading ? '…' : soBuoiTap}
                        </div>
                        <div style={{ color: 'var(--text-secondary)' }}>Buổi tập đã ghi</div>
                    </div>

                    <div style={{ background: 'var(--card2)', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '26px', fontWeight: 700, color: '#60a5fa' }}>
                            {soBuaAn}
                        </div>
                        <div style={{ color: 'var(--text-secondary)' }}>Bữa ăn đã ghi</div>
                    </div>

                    <div style={{ background: 'var(--card2)', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '26px', fontWeight: 700, color: '#f59e0b' }}>
                            {statsLoading ? '…' : soNgayHoatDong}
                        </div>
                        <div style={{ color: 'var(--text-secondary)' }}>Ngày hoạt động</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Profile
