import { createContext, useContext, useState, useEffect } from 'react'
import { useApp } from './AppContext'
import { useAuth } from './AuthContext'
import { db } from '../firebase'
import {
    collection, addDoc, getDocs, deleteDoc,
    doc, query, orderBy, serverTimestamp, onSnapshot
} from 'firebase/firestore'

const FoodContext = createContext()

function tinhGoal(canNang, chieuCao, tuoi, mucTieu) {
    const kg = parseFloat(canNang)
    const cm = parseFloat(chieuCao)
    const age = parseInt(tuoi)

    if (!kg || !cm || !age) {
        return { calories: 2500, protein: 150, carbs: 300, fat: 80 }
    }

    const bmr = 10 * kg + 6.25 * cm - 5 * age + 5
    const tdee = Math.round(bmr * 1.55)

    let calories, protein, carbs, fat

    if (mucTieu === 'Tăng cơ') {
        calories = tdee + 300
        protein = Math.round(kg * 2.2)
        fat = Math.round((calories * 0.25) / 9)
        carbs = Math.round((calories - protein * 4 - fat * 9) / 4)
    } else if (mucTieu === 'Giảm mỡ') {
        calories = tdee - 400
        protein = Math.round(kg * 2.4)
        fat = Math.round((calories * 0.25) / 9)
        carbs = Math.round((calories - protein * 4 - fat * 9) / 4)
    } else if (mucTieu === 'Tăng cơ/Giảm mỡ') {
        calories = tdee
        protein = Math.round(kg * 2.0)
        fat = Math.round((calories * 0.28) / 9)
        carbs = Math.round((calories - protein * 4 - fat * 9) / 4)
    } else {
        calories = tdee + 100
        protein = Math.round(kg * 1.6)
        fat = Math.round((calories * 0.25) / 9)
        carbs = Math.round((calories - protein * 4 - fat * 9) / 4)
    }

    return {
        calories: Math.max(calories, 1500),
        protein: Math.max(protein, 50),
        carbs: Math.max(carbs, 50),
        fat: Math.max(fat, 30),
    }
}

export function FoodProvider({ children }) {
    const { canNang, chieuCao, tuoi, mucTieu } = useApp()
    const { user } = useAuth()
    const [foodLog, setFoodLog] = useState([])
    const [loadingFood, setLoadingFood] = useState(true)

    const dailyGoal = tinhGoal(canNang, chieuCao, tuoi, mucTieu)

    // Listen realtime từ Firestore theo user
    useEffect(() => {
        if (!user) {
            setFoodLog([])
            setLoadingFood(false)
            return
        }

        const colRef = collection(db, 'users', user.uid, 'foodLog')
        const q = query(colRef, orderBy('thoiGian', 'desc'))

        const unsub = onSnapshot(q, (snap) => {
            const data = snap.docs.map(d => ({
                id: d.id,
                ...d.data(),
                // Convert Firestore Timestamp → JS Date string để dùng như cũ
                time: d.data().thoiGian?.toDate?.()?.toLocaleString('vi-VN') ?? d.data().time ?? ''
            }))
            setFoodLog(data)
            setLoadingFood(false)
        }, (err) => {
            console.error('FoodContext snapshot error:', err)
            setLoadingFood(false)
        })

        return () => unsub()
    }, [user])

    // Thêm bữa ăn
    const addMeal = async (meal) => {
        if (!user) return
        const colRef = collection(db, 'users', user.uid, 'foodLog')
        await addDoc(colRef, {
            ...meal,
            thoiGian: serverTimestamp(),
        })
    }

    // Xóa bữa ăn
    const deleteMeal = async (id) => {
        if (!user) return
        await deleteDoc(doc(db, 'users', user.uid, 'foodLog', id))
    }

    // Tính tổng hôm nay
    const getTodayTotal = () => {
        const today = new Date().toDateString()
        const todayMeals = foodLog.filter(m => {
            // time là string vi-VN locale, cần parse lại
            const d = new Date(m.thoiGian?.toDate?.() ?? m.time ?? 0)
            return d.toDateString() === today
        })
        const total = { calories: 0, protein: 0, carbs: 0, fat: 0 }
        todayMeals.forEach(meal => {
            total.calories += meal.calories || 0
            total.protein += meal.protein || 0
            total.carbs += meal.carbs || 0
            total.fat += meal.fat || 0
        })
        return total
    }

    const getRemaining = () => {
        const total = getTodayTotal()
        return {
            calories: Math.max(0, dailyGoal.calories - total.calories),
            protein: Math.max(0, dailyGoal.protein - total.protein),
            carbs: Math.max(0, dailyGoal.carbs - total.carbs),
            fat: Math.max(0, dailyGoal.fat - total.fat)
        }
    }

    // Lấy meals hôm nay (dùng cho AICoach)
    const getTodayMeals = () => {
        const today = new Date().toDateString()
        return foodLog.filter(m => {
            const d = new Date(m.thoiGian?.toDate?.() ?? m.time ?? 0)
            return d.toDateString() === today
        })
    }

    return (
        <FoodContext.Provider value={{
            foodLog,
            loadingFood,
            addMeal,
            deleteMeal,
            getTodayTotal,
            getTodayMeals,
            getRemaining,
            dailyGoal
        }}>
            {children}
        </FoodContext.Provider>
    )
}

export const useFood = () => useContext(FoodContext)
