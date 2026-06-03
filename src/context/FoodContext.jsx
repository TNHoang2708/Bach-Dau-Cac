import { createContext, useContext, useState, useEffect } from 'react'
import { useApp } from './AppContext'

const FoodContext = createContext()

// Tính dailyGoal động từ thông tin user
function tinhGoal(canNang, chieuCao, tuoi, mucTieu) {
    const kg = parseFloat(canNang)
    const cm = parseFloat(chieuCao)
    const age = parseInt(tuoi)

    // Nếu chưa nhập đủ thì trả về default
    if (!kg || !cm || !age) {
        return { calories: 2500, protein: 150, carbs: 300, fat: 80 }
    }

    // BMR công thức Mifflin-St Jeor (dùng nam, vì app gym)
    const bmr = 10 * kg + 6.25 * cm - 5 * age + 5
    // TDEE x1.55 (tập vừa phải)
    const tdee = Math.round(bmr * 1.55)

    let calories, protein, carbs, fat

    if (mucTieu === 'Tăng cơ') {
        calories = tdee + 300
        protein = Math.round(kg * 2.2)         // 2.2g/kg
        fat = Math.round((calories * 0.25) / 9) // 25% calo từ fat
        carbs = Math.round((calories - protein * 4 - fat * 9) / 4)
    } else if (mucTieu === 'Giảm mỡ') {
        calories = tdee - 400
        protein = Math.round(kg * 2.4)         // giữ cơ khi cut
        fat = Math.round((calories * 0.25) / 9)
        carbs = Math.round((calories - protein * 4 - fat * 9) / 4)
    } else if (mucTieu === 'Tăng cơ/Giảm mỡ') {
        calories = tdee
        protein = Math.round(kg * 2.0)
        fat = Math.round((calories * 0.28) / 9)
        carbs = Math.round((calories - protein * 4 - fat * 9) / 4)
    } else {
        // Tăng sức bền
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
    const [foodLog, setFoodLog] = useState([])

    const dailyGoal = tinhGoal(canNang, chieuCao, tuoi, mucTieu)

    // Load từ localStorage
    useEffect(() => {
        const saved = localStorage.getItem("foodLog")
        if (saved) setFoodLog(JSON.parse(saved))
    }, [])

    // Lưu khi thay đổi
    useEffect(() => {
        localStorage.setItem("foodLog", JSON.stringify(foodLog))
    }, [foodLog])

    // Thêm bữa ăn
    const addMeal = (meal) => {
        setFoodLog(prev => [...prev, {
            ...meal,
            id: Date.now(),
            time: new Date().toLocaleString()
        }])
    }

    // Tính tổng hôm nay
    const getTodayTotal = () => {
        const today = new Date().toDateString()
        const todayMeals = foodLog.filter(m =>
            new Date(m.time).toDateString() === today
        )
        const total = { calories: 0, protein: 0, carbs: 0, fat: 0 }
        todayMeals.forEach(meal => {
            total.calories += meal.calories || 0
            total.protein += meal.protein || 0
            total.carbs += meal.carbs || 0
            total.fat += meal.fat || 0
        })
        return total
    }

    // Tính còn thiếu
    const getRemaining = () => {
        const total = getTodayTotal()
        return {
            calories: Math.max(0, dailyGoal.calories - total.calories),
            protein: Math.max(0, dailyGoal.protein - total.protein),
            carbs: Math.max(0, dailyGoal.carbs - total.carbs),
            fat: Math.max(0, dailyGoal.fat - total.fat)
        }
    }

    return (
        <FoodContext.Provider value={{
            foodLog,
            addMeal,
            getTodayTotal,
            getRemaining,
            dailyGoal
        }}>
            {children}
        </FoodContext.Provider>
    )
}

export const useFood = () => useContext(FoodContext)
