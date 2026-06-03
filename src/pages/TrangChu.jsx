import FormInfo from '../components/FormInfo'
import GoalPicker from '../components/GoalPicker'
import KetQua from '../components/KetQua'
import { useApp } from '../context/AppContext'
import { Zap } from 'lucide-react'
import AICoach from '../components/AICoach'

function TrangChu() {
    const { tuoi, canNang, chieuCao, mucTieu, soNgay, setSoNgay, setKetQua, setLoading } = useApp()

    const taoLichTap = async () => {
        if (!tuoi || !canNang || !chieuCao) {
            alert("Vui lòng nhập đầy đủ thông tin!");
            return;
        }

        setLoading(true);
        setKetQua('');

        var prompt = `Bạn là chuyên gia thể hình và dinh dưỡng thể thao. Hãy tạo lịch tập gym chi tiết và khoa học cho:
- Tuổi: ${tuoi}
- Cân nặng: ${canNang}kg  
- Chiều cao: ${chieuCao}cm
- Mục tiêu: ${mucTieu}
- Số ngày tập: ${soNgay}

Yêu cầu:
1. Chia lịch tập theo từng ngày cụ thể (Thứ 2, Thứ 3...)
2. Mỗi ngày có tên nhóm cơ (VD: PUSH - Ngực, Vai, Tay sau)
3. Mỗi bài tập ghi rõ: tên bài, số sets x reps, thời gian nghỉ
4. Có lưu ý về khởi động và hạ nhiệt
5. Có gợi ý dinh dưỡng phù hợp mục tiêu`

        try {
            var response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_KEY}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            var data = await response.json();
            var result = data.candidates[0].content.parts[0].text;
            setKetQua(result);
            localStorage.setItem("lichTap", result)

        } catch (error) {
            setKetQua("Có lỗi xảy ra: " + error.message);
        }

        setLoading(false);
    }

    const options = ['3 ngày', '4 ngày', '5 ngày', '6 ngày']

    return (
        <div>
            <FormInfo />
            <GoalPicker />

            <div className="card">
                <div className="card-title">Số ngày tập mỗi tuần</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                    {options.map(opt => (
                        <div
                            key={opt}
                            onClick={() => setSoNgay(opt)}
                            className={`goal-card ${soNgay === opt ? 'active' : ''}`}
                            style={{ padding: '14px 0', flexDirection: 'column', gap: '2px' }}
                        >
                            <strong style={{
                                fontSize: '22px',
                                color: soNgay === opt ? 'var(--accent)' : 'var(--text)'
                            }}>
                                {opt.replace(' ngày', '')}
                            </strong>
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>ngày</span>
                        </div>
                    ))}
                </div>
            </div>

            <button onClick={taoLichTap} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Zap size={18} /> Tạo lịch tập ngay
            </button>

            <KetQua />
            <AICoach />
        </div>
    )
}

export default TrangChu
