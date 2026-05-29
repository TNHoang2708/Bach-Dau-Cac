import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import {
    collection, addDoc, getDocs, deleteDoc,
    doc, query, orderBy, serverTimestamp
} from 'firebase/firestore'

const BAI_TAP_GOM = [
    'Bench Press', 'Squat', 'Deadlift', 'Pull-up', 'Push-up',
    'Shoulder Press', 'Bicep Curl', 'Tricep Dip', 'Leg Press',
    'Lat Pulldown', 'Row', 'Plank', 'Lunges', 'Khác'
]

function NhatKy() {
    const { user } = useAuth()
    const [buoiTap, setBuoiTap] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)

    // Form state
    const [ngay, setNgay] = useState(new Date().toISOString().split('T')[0])
    const [ghiChu, setGhiChu] = useState('')
    const [baiTaps, setBaiTaps] = useState([
        { ten: '', sets: '', reps: '', kg: '' }
    ])
    const [saving, setSaving] = useState(false)

    const colRef = collection(db, 'users', user.uid, 'nhatky')

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const q = query(colRef, orderBy('thoiGian', 'desc'))
            const snap = await getDocs(q)
            setBuoiTap(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        } catch (e) {
            console.error(e)
        }
        setLoading(false)
    }

    const themBaiTap = () => {
        setBaiTaps([...baiTaps, { ten: '', sets: '', reps: '', kg: '' }])
    }

    const xoaBaiTap = (i) => {
        setBaiTaps(baiTaps.filter((_, idx) => idx !== i))
    }

    const capNhatBaiTap = (i, field, val) => {
        const arr = [...baiTaps]
        arr[i][field] = val
        setBaiTaps(arr)
    }

    const luuBuoi = async () => {
        if (!ngay || baiTaps.some(b => !b.ten)) {
            alert('Vui lòng điền đầy đủ tên bài tập!')
            return
        }
        setSaving(true)
        try {
            await addDoc(colRef, {
                ngay,
                ghiChu,
                baiTaps,
                thoiGian: serverTimestamp()
            })
            setShowForm(false)
            setBaiTaps([{ ten: '', sets: '', reps: '', kg: '' }])
            setGhiChu('')
            setNgay(new Date().toISOString().split('T')[0])
            await fetchData()
        } catch (e) {
            alert('Lỗi lưu dữ liệu!')
        }
        setSaving(false)
    }

    const xoaBuoi = async (id) => {
        if (!confirm('Xóa buổi tập này?')) return
        await deleteDoc(doc(db, 'users', user.uid, 'nhatky', id))
        await fetchData()
    }

    const formatNgay = (str) => {
        if (!str) return ''
        const [y, m, d] = str.split('-')
        return `${d}/${m}/${y}`
    }

    return (
        <div>
            {/* Header */}
            <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <div className="card-title" style={{ marginBottom: '4px' }}>📝 Nhật ký tập luyện</div>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {buoiTap.length} buổi tập đã ghi lại
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    style={{ width: 'auto', padding: '10px 20px', fontSize: '14px' }}
                >
                    {showForm ? '✕ Đóng' : '+ Thêm buổi tập'}
                </button>
            </div>

            {/* Form thêm buổi tập */}
            {showForm && (
                <div className="card">
                    <div className="card-title">➕ Buổi tập mới</div>

                    <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: '16px' }}>
                        <div className="field">
                            <label>Ngày tập</label>
                            <input type="date" value={ngay} onChange={e => setNgay(e.target.value)} />
                        </div>
                        <div className="field">
                            <label>Ghi chú (tuỳ chọn)</label>
                            <input
                                type="text"
                                placeholder="VD: Hôm nay tập tốt!"
                                value={ghiChu}
                                onChange={e => setGhiChu(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Danh sách bài tập */}
                    <div style={{ marginBottom: '12px' }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
                            gap: '8px',
                            marginBottom: '8px'
                        }}>
                            {['Bài tập', 'Sets', 'Reps', 'Kg', ''].map((h, i) => (
                                <div key={i} style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{h}</div>
                            ))}
                        </div>

                        {baiTaps.map((b, i) => (
                            <div key={i} style={{
                                display: 'grid',
                                gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
                                gap: '8px',
                                marginBottom: '8px',
                                alignItems: 'center'
                            }}>
                                <select value={b.ten} onChange={e => capNhatBaiTap(i, 'ten', e.target.value)}>
                                    <option value="">Chọn bài tập</option>
                                    {BAI_TAP_GOM.map(t => <option key={t}>{t}</option>)}
                                </select>
                                <input type="number" placeholder="4" value={b.sets} onChange={e => capNhatBaiTap(i, 'sets', e.target.value)} />
                                <input type="number" placeholder="10" value={b.reps} onChange={e => capNhatBaiTap(i, 'reps', e.target.value)} />
                                <input type="number" placeholder="60" value={b.kg} onChange={e => capNhatBaiTap(i, 'kg', e.target.value)} />
                                <button
                                    onClick={() => xoaBaiTap(i)}
                                    style={{
                                        width: 'auto', padding: '8px 12px',
                                        background: 'rgba(239,68,68,0.15)',
                                        color: '#ef4444', fontSize: '14px'
                                    }}
                                >✕</button>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={themBaiTap}
                        style={{
                            background: 'var(--card2)',
                            color: 'var(--text)',
                            border: '1px dashed var(--border)',
                            marginBottom: '16px',
                            fontSize: '14px'
                        }}
                    >
                        + Thêm bài tập
                    </button>

                    <button onClick={luuBuoi} disabled={saving}>
                        {saving ? '⏳ Đang lưu...' : '💾 Lưu buổi tập'}
                    </button>
                </div>
            )}

            {/* Danh sách buổi tập */}
            {loading ? (
                <div className="loading-box">
                    <div className="spinner"></div>
                    <p>Đang tải dữ liệu...</p>
                </div>
            ) : buoiTap.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
                    <p style={{ color: 'var(--text-secondary)' }}>Chưa có buổi tập nào. Hãy thêm buổi đầu tiên!</p>
                </div>
            ) : (
                buoiTap.map((buoi) => (
                    <div key={buoi.id} className="card" style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <div>
                                <div style={{ fontWeight: '700', fontSize: '16px', color: 'var(--accent)' }}>
                                    📅 {formatNgay(buoi.ngay)}
                                </div>
                                {buoi.ghiChu && (
                                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                        💬 {buoi.ghiChu}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => xoaBuoi(buoi.id)}
                                style={{
                                    width: 'auto', padding: '8px 14px',
                                    background: 'rgba(239,68,68,0.1)',
                                    color: '#ef4444', fontSize: '13px'
                                }}
                            >🗑️ Xóa</button>
                        </div>

                        <div style={{ display: 'grid', gap: '8px' }}>
                            {buoi.baiTaps?.map((b, i) => (
                                <div key={i} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '10px 14px',
                                    background: 'var(--card2)',
                                    borderRadius: '10px',
                                    fontSize: '14px'
                                }}>
                                    <span style={{ fontWeight: '600' }}>{b.ten}</span>
                                    <span style={{ color: 'var(--text-secondary)' }}>
                                        {b.sets && b.reps ? `${b.sets} sets × ${b.reps} reps` : ''}
                                        {b.kg ? ` · ${b.kg}kg` : ''}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            )}
        </div>
    )
}

export default NhatKy
