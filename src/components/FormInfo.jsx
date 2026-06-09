import { useApp } from '../context/AppContext'
import { Calendar, Weight, Ruler } from 'lucide-react'

function FormInfo() {
    const {
        tuoi, setTuoi,
        canNang, setCanNang,
        chieuCao, setChieuCao,
    } = useApp()

    return (
        <div className="card">
            <div className="card-title">Thông tin cơ bản</div>
            <div className="form-grid">
                <div className="field">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={13} color='var(--text-secondary)' /> Tuổi
                    </label>
                    <input
                        type="number"
                        value={tuoi}
                        onChange={(e) => setTuoi(e.target.value)}
                        placeholder="25"
                        min="10" max="100"
                    />
                </div>
                <div className="field">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Weight size={13} color='var(--text-secondary)' /> Cân nặng (kg)
                    </label>
                    <input
                        type="number"
                        value={canNang}
                        onChange={(e) => setCanNang(e.target.value)}
                        placeholder="70"
                        min="30" max="200"
                    />
                </div>
                <div className="field">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Ruler size={13} color='var(--text-secondary)' /> Chiều cao (cm)
                    </label>
                    <input
                        type="number"
                        value={chieuCao}
                        onChange={(e) => setChieuCao(e.target.value)}
                        placeholder="175"
                        min="100" max="250"
                    />
                </div>
            </div>
        </div>
    )
}

export default FormInfo
