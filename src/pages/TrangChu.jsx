import FormInfo from '../components/FormInfo'
import GoalPicker from '../components/GoalPicker'
import KetQua from '../components/KetQua'
import { useApp } from '../context/AppContext'
import { Zap } from 'lucide-react'
import AICoach from '../components/AICoach'
import { callGemini } from '../utils/gemini'

function TrangChu() {
    const {
        tuoi,
        canNang,
        chieuCao,
        kinhNghiem,
        benhLy,
        mucTieu,
        soNgay,
        setSoNgay,
        setKetQua,
        setLoading
    } = useApp()

    const bmi =
        canNang && chieuCao
            ? canNang / Math.pow(chieuCao / 100, 2)
            : 0

    const taoLichTap = async () => {
        if (!tuoi || !canNang || !chieuCao) {
            alert("Vui lòng nhập đầy đủ thông tin!");
            return;
        }

        setLoading(true);
        setKetQua('');

        var prompt = `
Bạn là huấn luyện viên thể hình.

Hãy trả lời CHỈ bằng JSON hợp lệ.

Format:

{
  "schedule": [
    {
      "day": "Thứ 2",
      "group": "PUSH",
      "exercises": [
        {
          "name": "Bench Press",
          "sets": "4",
          "reps": "8-10"
        }
      ]
    }
  ]
}

Thông tin người dùng:
- Tuổi: ${tuoi}
- Cân nặng: ${canNang}kg
- Chiều cao: ${chieuCao}cm
- BMI: ${bmi.toFixed(1)}
- Kinh nghiệm tập luyện: ${kinhNghiem}
- Tình trạng sức khỏe: ${benhLy}
- Mục tiêu: ${mucTieu}
- Số ngày tập: ${soNgay}

Không giải thích.
Không markdown.
Chỉ JSON.
`;

        try {
            var data = await callGemini(import.meta.env.VITE_GEMINI_KEY, {
                contents: [{ parts: [{ text: prompt }] }]
            })
            var raw = data.candidates[0].content.parts[0].text;

            var clean = raw
                .replace(/```json/g, '')
                .replace(/```/g, '')
                .trim();

            var result = JSON.parse(clean);

            setKetQua(result);
            localStorage.setItem(
                "lichTap",
                JSON.stringify(result)
            )

        } catch (error) {
            setKetQua("Có lỗi xảy ra: " + error.message);
        }

        setLoading(false);
    }

    const options = ['3 ngày', '4 ngày', '5 ngày', '6 ngày']

    return (
        <div className="trangchu-container">

            <FormInfo />

            <div className="planner-layout">

                <div className="planner-sidebar">

                    <GoalPicker />

                    <div className="card">
                        <div className="card-title">Số ngày tập mỗi tuần</div>

                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(4, 1fr)',
                                gap: '10px'
                            }}
                        >
                            {options.map(opt => (
                                <div
                                    key={opt}
                                    onClick={() => setSoNgay(opt)}
                                    className={`goal-card ${soNgay === opt ? 'active' : ''}`}
                                    style={{
                                        padding: '14px 0',
                                        flexDirection: 'column',
                                        gap: '2px'
                                    }}
                                >
                                    <strong
                                        style={{
                                            fontSize: '22px',
                                            color:
                                                soNgay === opt
                                                    ? 'var(--accent)'
                                                    : 'var(--text)'
                                        }}
                                    >
                                        {opt.replace(' ngày', '')}
                                    </strong>

                                    <span
                                        style={{
                                            fontSize: '12px',
                                            color: 'var(--text-secondary)'
                                        }}
                                    >
                                        ngày
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={taoLichTap}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        <Zap size={18} />
                        Tạo lịch tập ngay
                    </button>

                </div>

                <div className="planner-result">
                    <KetQua />
                </div>

            </div>

            <AICoach />

        </div>
    )
}

export default TrangChu
