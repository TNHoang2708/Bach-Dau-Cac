// utils/gemini.js
// Gọi Gemini với retry tự động khi gặp 503/429

const MODELS = [
    'gemini-2.5-flash',
    'gemini-1.5-flash',
]

const delay = (ms) => new Promise(res => setTimeout(res, ms))

/**
 * Gọi Gemini API với retry + fallback model
 * @param {string} key - API key
 * @param {object} body - request body (contents, generationConfig, ...)
 * @param {number} maxRetries - số lần thử lại mỗi model (default 2)
 */
export async function callGemini(key, body, maxRetries = 2) {
    let lastError = null

    for (const model of MODELS) {
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`
                const res = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                })

                if (res.status === 503 || res.status === 429) {
                    // Overloaded — chờ rồi thử lại
                    const waitMs = 1500 * (attempt + 1)
                    console.warn(`Gemini ${model} trả về ${res.status}, thử lại sau ${waitMs}ms...`)
                    await delay(waitMs)
                    lastError = new Error(`Gemini ${res.status}`)
                    continue
                }

                if (!res.ok) {
                    const errText = await res.text()
                    throw new Error(`Gemini ${res.status}: ${errText}`)
                }

                const data = await res.json()
                return data // thành công

            } catch (err) {
                lastError = err
                if (attempt < maxRetries) await delay(1000 * (attempt + 1))
            }
        }

        console.warn(`Model ${model} thất bại, thử model tiếp theo...`)
    }

    throw lastError ?? new Error('Gemini API không phản hồi')
}
