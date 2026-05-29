import { useState } from 'react'
import { Weight, Ruler, User, BarChart2, Lightbulb, ChevronRight, Mars, Venus } from 'lucide-react'

function BMI() {
    const [canNang, setCanNang] = useState('')
    const [chieuCao, setChieuCao] = useState('')
    const [tuoi, setTuoi] = useState('')
    const [gioiTinh, setGioiTinh] = useState('nam')
    const [ketQua, setKetQua] = useState(null)

    const tinhBMI = () => {
        const kg = parseFloat(canNang)
        const cm = parseFloat(chieuCao)
        const age = parseInt(tuoi)
        if (!kg || !cm || !age) { alert("Vui lòng nhập đầy đủ thông tin!"); return }
        const m = cm / 100
        const bmi = kg / (m * m)
        const bmiRound = Math.round(bmi * 10) / 10
        let phanLoai = '', mauSac = '', moTa = '', goiY = ''
        if (bmi < 18.5) { phanLoai = 'Thiếu cân'; mauSac = '#60a5fa'; moTa = 'Bạn đang thiếu cân so với chuẩn.'; goiY = 'Tăng cường ăn uống, bổ sung protein và calo. Tập các bài tăng cơ như squat, deadlift, bench press.' }
        else if (bmi < 23) { phanLoai = 'Bình thường'; mauSac = '#00d4a0'; moTa = 'Cân nặng của bạn đang ở mức lý tưởng!'; goiY = 'Duy trì chế độ ăn cân bằng và tập luyện đều đặn 3-4 buổi/tuần.' }
        else if (bmi < 25) { phanLoai = 'Thừa cân nhẹ'; mauSac = '#fbbf24'; moTa = 'Bạn đang ở ngưỡng thừa cân nhẹ.'; goiY = 'Giảm tinh bột, tăng rau xanh và protein. Cardio 30 phút/ngày kết hợp tập tạ.' }
        else if (bmi < 30) { phanLoai = 'Thừa cân'; mauSac = '#f97316'; moTa = 'Bạn đang thừa cân, cần điều chỉnh.'; goiY = 'Tạo thâm hụt calo 300-500 kcal/ngày. Cardio đều đặn, hạn chế đồ ngọt và đồ chiên rán.' }
        else { phanLoai = 'Béo phì'; mauSac = '#ef4444'; moTa = 'Bạn đang ở mức béo phì, cần thay đổi ngay.'; goiY = 'Tham khảo chuyên gia dinh dưỡng. Bắt đầu với đi bộ 30-45 phút/ngày, giảm dần calo nạp vào.' }
        const bmiLyTuong = gioiTinh === 'nam' ? 22 : 21
        const canNangLyTuong = Math.round(bmiLyTuong * m * m)
        let bmr = gioiTinh === 'nam' ? 10 * kg + 6.25 * cm - 5 * age + 5 : 10 * kg + 6.25 * cm - 5 * age - 161
        const tdee = Math.round(bmr * 1.55)
        setKetQua({ bmi: bmiRound, phanLoai, mauSac, moTa, goiY, canNangLyTuong, tdee })
    }

    const percentage = ketQua ? Math.min(Math.max(((ketQua.bmi - 10) / 30) * 100, 0), 100) : 0

    return (
        <div>
            <div className="card">
                <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BarChart2 size={16} /> Tính chỉ số BMI
                </div>
                <div className="form-grid">
                    <div className="field">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Weight size={14} /> Cân nặng (kg)</label>
                        <input type="number" placeholder="70" value={canNang} onChange={e => setCanNang(e.target.value)} />
                    </div>
                    <div className="field">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Ruler size={14} /> Chiều cao (cm)</label>
                        <input type="number" placeholder="170" value={chieuCao} onChange={e => setChieuCao(e.target.value)} />
                    </div>
                    <div className="field">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><User size={14} /> Tuổi</label>
                        <input type="number" placeholder="25" value={tuoi} onChange={e => setTuoi(e.target.value)} />
                    </div>
                </div>
                <div style={{ marginTop: '16px' }}>
                    <label style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '10px' }}>Giới tính</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        {[{ val: 'nam', label: 'Nam', icon: <Mars size={16} /> }, { val: 'nu', label: 'Nữ', icon: <Venus size={16} /> }].map(g => (
                            <div key={g.val} onClick={() => setGioiTinh(g.val)} className={`goal-card ${gioiTinh === g.val ? 'active' : ''}`}
                                style={{ padding: '14px', flexDirection: 'row', justifyContent: 'center', gap: '8px', color: gioiTinh === g.val ? 'var(--accent)' : 'var(--text-secondary)' }}>
                                {g.icon}
                                <strong style={{ fontSize: '15px' }}>{g.label}</strong>
                            </div>
                        ))}
                    </div>
                </div>
                <button style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={tinhBMI}>
                    <BarChart2 size={16} /> Tính BMI
                </button>
            </div>

            {ketQua && (
                <div className="card" style={{ textAlign: 'center' }}>
                    <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ChevronRight size={16} /> Kết quả
                    </div>
                    <div style={{ fontSize: '72px', fontWeight: '800', color: ketQua.mauSac, lineHeight: 1, marginBottom: '8px' }}>{ketQua.bmi}</div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: ketQua.mauSac, marginBottom: '8px' }}>{ketQua.phanLoai}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>{ketQua.moTa}</div>
                    <div style={{ marginBottom: '24px' }}>
                        <div style={{ height: '12px', borderRadius: '99px', background: 'linear-gradient(to right, #60a5fa, #00d4a0, #fbbf24, #f97316, #ef4444)', position: 'relative', marginBottom: '8px' }}>
                            <div style={{ position: 'absolute', left: `${percentage}%`, top: '-4px', width: '20px', height: '20px', background: ketQua.mauSac, borderRadius: '50%', border: '3px solid #fff', transform: 'translateX(-50%)', boxShadow: `0 0 10px ${ketQua.mauSac}` }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
                            <span>Thiếu cân</span><span>Bình thường</span><span>Thừa cân</span><span>Béo phì</span>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                        <div style={{ background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Cân nặng lý tưởng</div>
                            <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--accent)' }}>{ketQua.canNangLyTuong} kg</div>
                        </div>
                        <div style={{ background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Calo duy trì / ngày</div>
                            <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--accent)' }}>{ketQua.tdee} kcal</div>
                        </div>
                    </div>
                    <div style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent)', borderRadius: '12px', padding: '16px', textAlign: 'left' }}>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--accent)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Lightbulb size={14} /> Gợi ý cho bạn
                        </div>
                        <div style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.7 }}>{ketQua.goiY}</div>
                    </div>
                </div>
            )}

            <div className="card">
                <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BarChart2 size={16} /> Bảng phân loại BMI (Châu Á)
                </div>
                {[
                    { range: '< 18.5', label: 'Thiếu cân', color: '#60a5fa' },
                    { range: '18.5 – 22.9', label: 'Bình thường', color: '#00d4a0' },
                    { range: '23 – 24.9', label: 'Thừa cân nhẹ', color: '#fbbf24' },
                    { range: '25 – 29.9', label: 'Thừa cân', color: '#f97316' },
                    { range: '≥ 30', label: 'Béo phì', color: '#ef4444' },
                ].map((row, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < 4 ? '1px solid var(--border)' : 'none', fontSize: '14px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>{row.range}</span>
                        <span style={{ color: row.color, fontWeight: '600' }}>{row.label}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default BMI
