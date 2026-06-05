import { useApp } from '../context/AppContext'
import { Calendar, Weight, Ruler } from 'lucide-react'

function FormInfo() {
    const {
        tuoi, setTuoi,
        canNang, setCanNang,
        chieuCao, setChieuCao,
        kinhNghiem, setKinhNghiem,
        benhLy, setBenhLy
    } = useApp()

    return (
        <div className="card">
            <div className="card-title">Thông tin cơ bản</div>
            <div className="form-grid">
                <div className="field">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar className="icon-sm" />
                        Tuổi
                    </label>
                    <input type="number" value={tuoi} onChange={(e) => setTuoi(e.target.value)} placeholder="25" />
                </div>
                <div className="field">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Weight className="icon-sm" /> Cân nặng (kg)
                    </label>
                    <input type="number" value={canNang} onChange={(e) => setCanNang(e.target.value)} placeholder="70" />
                </div>
                <div className="field">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Ruler className="icon-sm" /> Chiều cao (cm)
                    </label>
                    <input type="number" value={chieuCao} onChange={(e) => setChieuCao(e.target.value)} placeholder="175" />
                </div>
                <div className="field">
                    <label>Kinh nghiệm tập luyện</label>

                    <select
                        value={kinhNghiem}
                        onChange={(e) => setKinhNghiem(e.target.value)}
                    >
                        <option>Chưa từng tập</option>
                        <option>Dưới 6 tháng</option>
                        <option>6 tháng - 2 năm</option>
                        <option>Trên 2 năm</option>
                    </select>
                </div>
                <div className="field">
                    <label>Tình trạng sức khỏe</label>

                    <select
                        value={benhLy}
                        onChange={(e) => setBenhLy(e.target.value)}
                    >
                        <option>Không có</option>
                        <option>Đau đầu gối</option>
                        <option>Đau lưng</option>
                        <option>Huyết áp cao</option>
                        <option>Tiểu đường</option>
                        <option>Thoát vị đĩa đệm</option>
                    </select>
                </div>
            </div>
        </div>
    )
}

export default FormInfo