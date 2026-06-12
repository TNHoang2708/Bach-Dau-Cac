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
                    const hard = d.hardMemory || {}
                    const soft = d.softMemory || {}

                    // --- Cân nặng: ưu tiên field cũ, fallback hardMemory.weight ---
                    if (d.canNang) setCanNang(d.canNang)
                    else if (hard.weight) setCanNang(hard.weight)

                    // --- Chiều cao: ưu tiên field cũ, fallback hardMemory.height ---
                    if (d.chieuCao) setChieuCao(d.chieuCao)
                    else if (hard.height) setChieuCao(hard.height)

                    // --- Tuổi: field cũ (hardMemory chỉ có ageGroup dạng range, không dùng cho TDEE) ---
                    if (d.tuoi) setTuoi(d.tuoi)

                    // --- Kinh nghiệm: ưu tiên field cũ, fallback map từ softMemory.experience ---
                    if (d.kinhNghiem) setKinhNghiem(d.kinhNghiem)
                    else if (soft.experience) {
                        const expMap = {
                            beginner: 'Chưa từng tập',
                            novice: 'Dưới 1 năm',
                            intermediate: '1-3 năm',
                            advanced: 'Trên 3 năm',
                        }
                        setKinhNghiem(expMap[soft.experience] || 'Chưa từng tập')
                    }

                    // --- Bệnh lý: ưu tiên field cũ, fallback hardMemory.injuries ---
                    if (d.benhLy) setBenhLy(d.benhLy)
                    else if (hard.injuries && hard.injuries.length > 0 && !hard.injuries.includes('none')) {
                        const injuryMap = {
                            back: 'Đau khớp',
                            knee: 'Đau khớp',
                            shoulder: 'Đau khớp',
                            blood_pressure: 'Huyết áp cao',
                            other: 'Khác',
                        }
                        setBenhLy(injuryMap[hard.injuries[0]] || 'Khác')
                    }

                    // --- Mục tiêu: ưu tiên field cũ, fallback map từ softMemory.mainGoal ---
                    if (d.mucTieu) setMucTieu(d.mucTieu)
                    else if (soft.mainGoal) {
                        const goalMap = {
                            muscle_gain: 'Tăng cơ',
                            fat_loss: 'Giảm mỡ',
                            strength: 'Tăng sức bền',
                            general: 'Tăng cơ/Giảm mỡ',
                        }
                        setMucTieu(goalMap[soft.mainGoal] || 'Tăng cơ')
                    }

                    // --- Số ngày: ưu tiên field cũ, fallback softMemory.targetFrequency ---
                    if (d.soNgay) setSoNgay(d.soNgay)
                    else if (soft.targetFrequency) setSoNgay(`${soft.targetFrequency} ngày`)
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
    // Cân nặng & chiều cao: lưu CẢ field cũ VÀ hardMemory để AI Coach luôn đồng bộ
    const handleSetTuoi = (v) => { setTuoi(v); saveProfile({ tuoi: v }) }
    const handleSetCanNang = (v) => {
        setCanNang(v)
        saveProfile({ canNang: v, hardMemory: { weight: v } })
    }
    const handleSetChieuCao = (v) => {
        setChieuCao(v)
        saveProfile({ chieuCao: v, hardMemory: { height: v } })
    }
    const handleSetKinhNghiem = (v) => { setKinhNghiem(v); saveProfile({ kinhNghiem: v }) }
    const handleSetBenhLy = (v) => { setBenhLy(v); saveProfile({ benhLy: v }) }
    const handleSetMucTieu = (v) => {
        setMucTieu(v)
        // map ngược về softMemory.mainGoal cho AI Coach
        const reverseGoalMap = {
            'Tăng cơ': 'muscle_gain',
            'Giảm mỡ': 'fat_loss',
            'Tăng sức bền': 'strength',
            'Tăng cơ/Giảm mỡ': 'general',
        }
        saveProfile({
            mucTieu: v,
            softMemory: { mainGoal: reverseGoalMap[v] || 'general' }
        })
    }
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
