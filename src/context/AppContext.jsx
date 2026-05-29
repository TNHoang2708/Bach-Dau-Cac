import { createContext, useContext, useState, useEffect } from 'react'

const AppContext = createContext()

export function AppProvider({ children }) {
    const [tuoi, setTuoi] = useState('')
    const [canNang, setCanNang] = useState('')
    const [chieuCao, setChieuCao] = useState('')
    const [mucTieu, setMucTieu] = useState('Tăng cơ')
    const [soNgay, setSoNgay] = useState('3 ngày')
    const [ketQua, setKetQua] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        var lichTapCu = localStorage.getItem("lichTap")
        if (lichTapCu) setKetQua(lichTapCu)
    }, [])

    return (
        <AppContext.Provider value={{
            tuoi, setTuoi,
            canNang, setCanNang,
            chieuCao, setChieuCao,
            mucTieu, setMucTieu,
            soNgay, setSoNgay,
            ketQua, setKetQua,
            loading, setLoading
        }}>
            {children}
        </AppContext.Provider>
    )
}

export function useApp() {
    return useContext(AppContext)
}