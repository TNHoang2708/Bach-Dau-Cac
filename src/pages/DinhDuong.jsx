import { useState, useEffect } from 'react'
import { Camera, ClipboardList, UtensilsCrossed, Zap, Plus, Trash2 } from 'lucide-react'
import { useFood } from '../context/FoodContext'
import { callGemini } from '../utils/gemini'

const GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY

function DinhDuong() {
    const { addMeal, deleteMeal, foodLog, loadingFood } = useFood()
    const [anh, setAnh] = useState(null)
    const [preview, setPreview] = useState(null)
    const [ketQua, setKetQua] = useState(null)
    const [loading, setLoading] = useState(false)
    const [addedToLog, setAddedToLog] = useState(false)

    const chonAnh = (e) => {
        const file = e.target.files[0]
        if (!file) return
        setAnh(file)
        setPreview(URL.createObjectURL(file))
        setKetQua(null)
        setAddedToLog(false)
    }

    const compressAnh = (file) => {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas')
            const img = new Image()
            img.onload = () => {
                const maxSize = 400
                let w = img.width, h = img.height
                if (w > h) { h = (h * maxSize) / w; w = maxSize }
                else { w = (w * maxSize) / h; h = maxSize }
                canvas.width = w; canvas.height = h
                canvas.getContext('2d').drawImage(img, 0, 0, w, h)
                resolve(canvas.toDataURL('image/jpeg', 0.7))
            }
            img.src = URL.createObjectURL(file)
        })
    }

    const phanTich = async () => {
        if (!anh) { alert('Vui lòng chọn ảnh trước!'); return }
        setLoading(true)
        setKetQua(null)
        setAddedToLog(false)

        const reader = new FileReader()
        reader.readAsDataURL(anh)
        reader.onload = async () => {
            const base64 = reader.result.split(',')[1]

            const prompt = `Bạn là chuyên gia dinh dưỡng. Phân tích bữa ăn trong ảnh và trả về JSON theo đúng format sau, KHÔNG kèm markdown hay text thừa:
{
  "monAn": [
    { "ten": "Tên món", "khoiLuong": 100, "calories": 200, "protein": 15, "carbs": 20, "fat": 8 }
  ],
  "tongCalo": 500,
  "tongProtein": 30,
  "tongCarbs": 60,
  "tongFat": 15,
  "danhGia": "Đánh giá ngắn gọn bữa ăn cho người tập gym (1-2 câu)",
  "goiY": "Gợi ý cải thiện ngắn gọn (1-2 câu)"
}`

            try {
                const data = await callGemini(GEMINI_KEY, {
                    contents: [{
                        parts: [
                            { text: prompt },
                            { inline_data: { mime_type: anh.type, data: base64 } }
                        ]
                    }],
                    generationConfig: { responseMimeType: 'application/json' }
                })
                const rawText = data.candidates[0].content.parts[0].text
                const parsed = JSON.parse(rawText.replace(/```json|```/g, '').trim())
                setKetQua(parsed)
            } catch (error) {
                alert('❌ ' + (error.message.includes('503') || error.message.includes('429')
                    ? 'Gemini đang quá tải, thử lại sau vài giây nhé!'
                    : 'Có lỗi xảy ra: ' + error.message))
            }
            setLoading(false)
        }
    }

    const themVaoNhatKy = () => {
        if (!ketQua) return
        addMeal({
            name: ketQua.monAn.map(m => m.ten).join(', '),
            calories: ketQua.tongCalo,
            protein: ketQua.tongProtein,
            carbs: ketQua.tongCarbs,
            fat: ketQua.tongFat,
        })
        setAddedToLog(true)
    }

    useEffect(() => {
        const handlePaste = (e) => {
            const items = e.clipboardData.items
            for (let item of items) {
                if (item.type.startsWith('image/')) {
                    const file = item.getAsFile()
                    setAnh(file)
                    setPreview(URL.createObjectURL(file))
                    setKetQua(null)
                    setAddedToLog(false)
                }
            }
        }
        window.addEventListener('paste', handlePaste)
        return () => window.removeEventListener('paste', handlePaste)
    }, [])

    return (
        <div style={{ width: '100%' }}>
            <div className="card">
                <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Camera size={16} /> Phân tích bữa ăn với AI
                </div>

                <div className="upload-zone" onClick={() => document.getElementById('fileInput').click()}>
                    {preview
                        ? <img src={preview} alt="preview" style={{ width: '100%', borderRadius: '12px' }} />
                        : (
                            <div className="upload-placeholder">
                                <Camera size={40} color='#aaa' />
                                <p>Click để chọn ảnh hoặc <strong>Ctrl+V</strong> để paste</p>
                            </div>
                        )
                    }
                </div>
                <input id="fileInput" type="file" accept="image/*" onChange={chonAnh} style={{ display: 'none' }} />

                <button onClick={phanTich} disabled={loading} style={{
                    marginTop: '16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}>
                    <Zap size={15} /> {loading ? 'Đang phân tích...' : 'Phân tích bằng AI'}
                </button>

                {loading && (
                    <div className="loading-box">
                        <div className="spinner"></div>
                        <p>AI đang phân tích bữa ăn của bạn...</p>
                    </div>
                )}
            </div>

            {/* Kết quả */}
            {ketQua && (
                <div className="card" style={{ marginTop: '1rem' }}>
                    <div className="card-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>Kết quả phân tích</span>
                        <button
                            onClick={themVaoNhatKy}
                            disabled={addedToLog}
                            style={{
                                width: 'auto', padding: '8px 14px', fontSize: '13px',
                                display: 'flex', alignItems: 'center', gap: '6px',
                                background: addedToLog ? 'var(--accent-dim)' : 'var(--accent)',
                                color: addedToLog ? 'var(--accent)' : '#000',
                                border: addedToLog ? '1px solid var(--accent)' : 'none',
                            }}
                        >
                            <Plus size={14} /> {addedToLog ? '✓ Đã thêm vào nhật ký' : 'Thêm vào nhật ký'}
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '1.5rem' }}>
                        {[
                            { label: 'Calo', val: ketQua.tongCalo, unit: 'kcal', color: '#f59e0b' },
                            { label: 'Protein', val: ketQua.tongProtein, unit: 'g', color: 'var(--accent)' },
                            { label: 'Carbs', val: ketQua.tongCarbs, unit: 'g', color: '#60a5fa' },
                            { label: 'Fat', val: ketQua.tongFat, unit: 'g', color: '#f97316' },
                        ].map(({ label, val, unit, color }) => (
                            <div key={label} style={{
                                background: 'var(--card2)', borderRadius: '12px',
                                padding: '14px', textAlign: 'center', border: '1px solid var(--border)'
                            }}>
                                <div style={{ fontSize: '22px', fontWeight: '800', color }}>{val}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>{label} ({unit})</div>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                            Từng món ăn
                        </div>
                        {ketQua.monAn.map((mon, i) => (
                            <div key={i} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '10px 14px', background: 'var(--card2)',
                                borderRadius: '10px', marginBottom: '6px', fontSize: '13px'
                            }}>
                                <div>
                                    <span style={{ fontWeight: '600' }}>{mon.ten}</span>
                                    <span style={{ color: 'var(--text-secondary)', marginLeft: '8px' }}>~{mon.khoiLuong}g</span>
                                </div>
                                <div style={{ display: 'flex', gap: '12px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                                    <span style={{ color: '#f59e0b' }}>{mon.calories} kcal</span>
                                    <span>P: {mon.protein}g</span>
                                    <span>C: {mon.carbs}g</span>
                                    <span>F: {mon.fat}g</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div style={{
                            background: 'rgba(0,212,160,0.05)', border: '1px solid rgba(0,212,160,0.2)',
                            borderRadius: '10px', padding: '12px', fontSize: '13px', lineHeight: 1.6
                        }}>
                            <div style={{ fontWeight: '600', color: 'var(--accent)', marginBottom: '6px' }}>📊 Đánh giá</div>
                            {ketQua.danhGia}
                        </div>
                        <div style={{
                            background: 'rgba(96,165,250,0.05)', border: '1px solid rgba(96,165,250,0.2)',
                            borderRadius: '10px', padding: '12px', fontSize: '13px', lineHeight: 1.6
                        }}>
                            <div style={{ fontWeight: '600', color: '#60a5fa', marginBottom: '6px' }}>💡 Gợi ý</div>
                            {ketQua.goiY}
                        </div>
                    </div>
                </div>
            )}

            {/* Lịch sử từ Firestore */}
            {!loadingFood && foodLog.length > 0 && (
                <div className="card" style={{ marginTop: '1.5rem' }}>
                    <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ClipboardList size={16} /> Lịch sử bữa ăn ({foodLog.length})
                    </div>
                    {foodLog.map((buoi) => (
                        <div key={buoi.id} className="lichsu-item">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '8px',
                                    background: 'var(--card2)', border: '1px solid var(--border)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <UtensilsCrossed size={16} color='var(--text-secondary)' />
                                </div>
                                <div>
                                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>
                                        {buoi.name || 'Bữa ăn'}
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                        {buoi.calories} kcal · P: {buoi.protein}g · C: {buoi.carbs}g · F: {buoi.fat}g
                                    </div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                        {buoi.time}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => deleteMeal(buoi.id)}
                                style={{
                                    width: 'auto', padding: '6px 10px',
                                    background: 'transparent',
                                    border: '1px solid var(--border)',
                                    color: '#ef4444',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    display: 'flex', alignItems: 'center',
                                }}
                                title="Xóa bữa ăn"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default DinhDuong
