import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { db } from '../firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'

const AppContext = createContext()

export function AppProvider({ children }) {
    const { user } = useAuth()

    const [tuoi, setTuoi] = useState('')
    const [canNang, setCanNang] = useState('')
    const [chieuCao, setChieuCao] = useState('')
    const [kinhNghiem, setKinhNghiem] = useState('Chưa từng tập')
    const [benhLy, setBenhLy] = useState('Không có')
    const [mucTieu, setMucTieu] = useState('Tăng cơ')
    const [soNgay, setSoNgay] = useState('3 ngày')
    const [ketQua, setKetQua] = useState('')
    const [loading, setLoading] = useState(false)
    const [profileLoaded, setProfileLoaded] = useState(false)

    // Load profile từ Firestore khi user login
    useEffect(() => {
        if (!user) {
            // Reset khi logout
            setTuoi(''); setCanNang(''); setChieuCao('')
            setKinhNghiem('Chưa từng tập'); setBenhLy('Không có')
            setMucTieu('Tăng cơ'); setSoNgay('3 ngày')
            setKetQua(''); setProfileLoaded(false)
            return
        }

        const loadProfile = async () => {
            try {
                const ref = doc(db, 'users', user.uid, 'profile', 'info')
                const snap = await getDoc(ref)
                if (snap.exists()) {
                    const d = snap.data()
                    if (d.tuoi) setTuoi(d.tuoi)
                    if (d.canNang) setCanNang(d.canNang)
                    if (d.chieuCao) setChieuCao(d.chieuCao)
                    if (d.kinhNghiem) setKinhNghiem(d.kinhNghiem)
                    if (d.benhLy) setBenhLy(d.benhLy)
                    if (d.mucTieu) setMucTieu(d.mucTieu)
                    if (d.soNgay) setSoNgay(d.soNgay)
                }

                // Load lịch tập cũ
                const lichTapCu = localStorage.getItem(`lichTap_${user.uid}`)
                if (lichTapCu) setKetQua(JSON.parse(lichTapCu))

            } catch (err) {
                console.error('Load profile error:', err)
            }
            setProfileLoaded(true)
        }

        loadProfile()
    }, [user])

    // Auto-save profile lên Firestore mỗi khi thay đổi
    const saveProfile = useCallback(async (data) => {
        if (!user) return
        try {
            const ref = doc(db, 'users', user.uid, 'profile', 'info')
            await setDoc(ref, data, { merge: true })
        } catch (err) {
            console.error('Save profile error:', err)
        }
    }, [user])

    // Wrapper setters tự động save
    const handleSetTuoi = (v) => { setTuoi(v); saveProfile({ tuoi: v }) }
    const handleSetCanNang = (v) => { setCanNang(v); saveProfile({ canNang: v }) }
    const handleSetChieuCao = (v) => { setChieuCao(v); saveProfile({ chieuCao: v }) }
    const handleSetKinhNghiem = (v) => { setKinhNghiem(v); saveProfile({ kinhNghiem: v }) }
    const handleSetBenhLy = (v) => { setBenhLy(v); saveProfile({ benhLy: v }) }
    const handleSetMucTieu = (v) => { setMucTieu(v); saveProfile({ mucTieu: v }) }
    const handleSetSoNgay = (v) => { setSoNgay(v); saveProfile({ soNgay: v }) }

    // Lưu lịch tập theo uid để không bị lẫn
    const handleSetKetQua = (v) => {
        setKetQua(v)
        if (user && v) {
            localStorage.setItem(`lichTap_${user.uid}`, JSON.stringify(v))
        }
    }

    return (
        <AppContext.Provider value={{
            tuoi, setTuoi: handleSetTuoi,
            canNang, setCanNang: handleSetCanNang,
            chieuCao, setChieuCao: handleSetChieuCao,
            kinhNghiem, setKinhNghiem: handleSetKinhNghiem,
            benhLy, setBenhLy: handleSetBenhLy,
            mucTieu, setMucTieu: handleSetMucTieu,
            soNgay, setSoNgay: handleSetSoNgay,
            ketQua, setKetQua: handleSetKetQua,
            loading, setLoading,
            profileLoaded,
        }}>
            {children}
        </AppContext.Provider>
    )
}

export function useApp() {
    return useContext(AppContext)
}
