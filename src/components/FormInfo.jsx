import { useApp } from '../context/AppContext'
import { Cake, Weight, Ruler } from 'lucide-react'

function FormInfo() {
    const { tuoi, setTuoi, canNang, setCanNang, chieuCao, setChieuCao } = useApp()

    return (
        <div className="card">
            <div className="card-title">Thông tin cơ bản</div>
            <div className="form-grid">
                <div className="field">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Cake size={14} /> Tuổi
                    </label>
                    <input type="number" value={tuoi} onChange={(e) => setTuoi(e.target.value)} placeholder="25" />
                </div>
                <div className="field">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Weight size={14} /> Cân nặng (kg)
                    </label>
                    <input type="number" value={canNang} onChange={(e) => setCanNang(e.target.value)} placeholder="70" />
                </div>
                <div className="field">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Ruler size={14} /> Chiều cao (cm)
                    </label>
                    <input type="number" value={chieuCao} onChange={(e) => setChieuCao(e.target.value)} placeholder="175" />
                </div>
            </div>
        </div>
    )
}

export default FormInfo