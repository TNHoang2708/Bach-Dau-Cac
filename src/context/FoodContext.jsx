import { createContext, useContext, useState, useEffect } from 'react'

const FoodContext = createContext()

export function FoodProvider({ children }) {
    const [foodLog, setFoodLog] = useState([]) // [{name, protein, calories, time}]
    const [dailyGoal, setDailyGoal] = useState({
        calories: 3700,
        protein: 160,
        carbs: 540,
        fat: 105
    })

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

    // Gợi ý từ AI
    const getSuggestion = () => {
        const remaining = getRemaining()
        if (remaining.protein <= 0 && remaining.calories <= 0) {
            return "🎉 Hôm nay bạn đã đạt mục tiêu! Nghỉ ngơi thôi."
        }

        let suggestion = `⚠️ Hôm nay bạn còn thiếu:\n`
        if (remaining.calories > 0) suggestion += `• ${remaining.calories} calo\n`
        if (remaining.protein > 0) suggestion += `• ${remaining.protein}g protein\n`

        suggestion += `\n💪 Gợi ý bữa tiếp theo:\n`

        if (remaining.protein > 50) {
            suggestion += `• 200g ức gà (+62g protein, ~330 calo)\n`
        } else if (remaining.protein > 30) {
            suggestion += `• 100g ức gà (+31g protein, ~165 calo)\n`
            suggestion += `• 2 quả trứng (+13g protein, ~150 calo)\n`
        } else {
            suggestion += `• 2 quả trứng (+13g protein, ~150 calo)\n`
            suggestion += `• 1 hũ sữa chua Hy Lạp (+10g protein, ~100 calo)\n`
        }

        return suggestion
    }

    return (
        <FoodContext.Provider value={{
            foodLog,
            addMeal,
            getTodayTotal,
            getRemaining,
            getSuggestion,
            dailyGoal
        }}>
            {children}
        </FoodContext.Provider>
    )
}

export const useFood = () => useContext(FoodContext)