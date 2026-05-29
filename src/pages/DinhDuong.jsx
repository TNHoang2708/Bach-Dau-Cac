import { useState, useEffect } from 'react'

function DinhDuong() {
    const [anh, setAnh] = useState(null)
    const [preview, setPreview] = useState(null)
    const [ketQua, setKetQua] = useState('')
    const [loading, setLoading] = useState(false)

    const [lichSu, setLichSu] = useState([])

    useEffect(() => {
        const data = JSON.parse(localStorage.getItem("lichSuBuaAn")) || []
        setLichSu(data)
    }, [])

    const chonAnh = (e) => {
        const file = e.target.files[0]
        if (!file) return
        setAnh(file)
        setPreview(URL.createObjectURL(file))
    }

    const compressAnh = (file) => {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas')
            const img = new Image()
            img.onload = () => {
                const maxSize = 400
                let w = img.width
                let h = img.height
                if (w > h) { h = (h * maxSize) / w; w = maxSize }
                else { w = (w * maxSize) / h; h = maxSize }
                canvas.width = w
                canvas.height = h
                canvas.getContext('2d').drawImage(img, 0, 0, w, h)
                resolve(canvas.toDataURL('image/jpeg', 0.7))
            }
            img.src = URL.createObjectURL(file)
        })
    }

    const phanTich = async () => {
        if (!anh) {
            alert("Vui lòng chọn ảnh trước!")
            return
        }

        setLoading(true)
        setKetQua('')

        const reader = new FileReader()
        reader.readAsDataURL(anh)
        reader.onload = async () => {
            const base64 = reader.result.split(',')[1]
            const base64Full = reader.result
            const thumbnail = await compressAnh(anh)

            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_KEY}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{
                            parts: [
                                {
                                    text: `Bạn là chuyên gia dinh dưỡng thể thao. Phân tích chi tiết bữa ăn trong ảnh:

1. Liệt kê từng món ăn nhìn thấy được
2. Ước tính khối lượng từng món (gram)
3. Calo từng món (kcal)
4. **TỔNG CALO CẢ BỮA: X kcal** (ghi rõ to, dễ thấy)
5. Bảng dinh dưỡng: Protein (g), Carb (g), Chất béo (g), Chất xơ (g)
6. Đánh giá bữa ăn: tốt/chưa tốt cho người tập gym
7. Gợi ý cải thiện nếu cần

Trả lời bằng tiếng Việt, rõ ràng và dễ đọc.` },
                                { inline_data: { mime_type: anh.type, data: base64 } }
                            ]
                        }]
                    })
                })

                const data = await response.json()
                const result = data.candidates[0].content.parts[0].text
                setKetQua(result)
                // Lưu lịch sử bữa ăn
                const lichSuCu = JSON.parse(localStorage.getItem("lichSuBuaAn")) || []
                lichSuCu.unshift({
                    id: Date.now(),
                    preview: thumbnail, // ← đổi chỗ này
                    ketQua: result,
                    thoiGian: new Date().toLocaleString('vi-VN')
                })
                // Chỉ giữ 10 bữa gần nhất
                if (lichSuCu.length > 10) lichSuCu.pop()
                localStorage.setItem("lichSuBuaAn", JSON.stringify(lichSuCu))
                setLichSu(lichSuCu)
            } catch (error) {
                setKetQua("Có lỗi xảy ra: " + error.message)
            }

            setLoading(false)
        }
    }

    useEffect(() => {
        const handlePaste = (e) => {
            const items = e.clipboardData.items
            for (let item of items) {
                if (item.type.startsWith('image/')) {
                    const file = item.getAsFile()
                    setAnh(file)
                    setPreview(URL.createObjectURL(file))
                }
            }
        }

        window.addEventListener('paste', handlePaste)
        return () => window.removeEventListener('paste', handlePaste)
    }, [])

    return (
        <div>
            <div className="card">
                <div className="card-title">📸 Phân tích bữa ăn</div>

                <div
                    className="upload-zone"
                    onClick={() => document.getElementById('fileInput').click()}
                >
                    {preview
                        ? <img src={preview} alt="preview" style={{ width: '100%', borderRadius: '12px' }} />
                        : (
                            <div className="upload-placeholder">
                                <span style={{ fontSize: '40px' }}>📷</span>
                                <p>Click để chọn ảnh hoặc <strong>Ctrl+V</strong> để paste</p>
                            </div>
                        )
                    }
                </div>

                <input
                    id="fileInput"
                    type="file"
                    accept="image/*"
                    onChange={chonAnh}
                    style={{ display: 'none' }}
                />

                <button style={{ marginTop: '16px' }} onClick={phanTich}>
                    🔍 Phân tích dinh dưỡng
                </button>

                {loading && (
                    <div className="loading-box">
                        <div className="spinner"></div>
                        <p>Đang phân tích bữa ăn...</p>
                    </div>
                )}
            </div>

            {ketQua && (
                <div className="ketqua" dangerouslySetInnerHTML={{
                    __html: ketQua
                        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                        .replace(/### (.*?)(\n|$)/g, "<h3>$1</h3>")
                        .replace(/## (.*?)(\n|$)/g, "<h2>$1</h2>")
                        .replace(/\| (.+) \|/g, (match) => {
                            const cells = match.split('|').filter(c => c.trim() && !c.includes('---'))
                            if (cells.length === 0) return ''
                            return '<tr>' + cells.map(c => `<td>${c.trim()}</td>`).join('') + '</tr>'
                        })
                        .replace(/(<tr>.*<\/tr>)/gs, '<table>$1</table>')
                        .replace(/\n/g, "<br>")
                }} />

            )}
            {lichSu.length > 0 && (
                <div className="card" style={{ marginTop: '1.5rem' }}>
                    <div className="card-title">📋 Lịch sử bữa ăn</div>
                    {lichSu.map((buoi) => (
                        <div key={buoi.id} className="lichsu-item" onClick={() => {
                            setKetQua('')
                            setPreview(buoi.preview)
                            setTimeout(() => {
                                setKetQua(buoi.ketQua)
                                window.scrollTo({ top: 0, behavior: 'smooth' })
                            }, 50)
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                {buoi.preview && (
                                    <img src={buoi.preview} alt="" style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
                                )}
                                <span>🍽️ {buoi.thoiGian}</span>
                            </div>
                            <span className="lichsu-xem">Xem lại →</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default DinhDuong