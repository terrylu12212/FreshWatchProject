import OpenAI from 'openai'

function makeClient() {
    const key = process.env.OPENAI_API_KEY
    if (!key) return null
    return new OpenAI({ apiKey: key })
}

export async function runPrompt(req, res) {
    const client = makeClient()
    if (!client) {
        console.error('Failed to create OpenAI client')
        return res.status(500).json({ error: 'Failed to create OpenAI client'})
    }

    try {
                const prompt = (req.query && req.query.q) || (req.body && req.body.prompt) || 'Respond with a simple recipe idea.'
                const response = await client.chat.completions.create({
                    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
                    messages: [
                        { role: 'system', content: 'You are a concise, clear cooking assistant. Provide numbered recipe ideas, ingredient lists and short 3-5 step instructions.' },
                        { role: 'user', content: prompt }
                    ],
                    // token limit, increase if current responses are too short
                    max_tokens: Number(process.env.OPENAI_MAX_TOKENS || 800),
                    temperature: 0.7,
                })

        const text = response.choices?.[0]?.message?.content ?? ''
        return res.json({ text })
    } catch (error) {
        console.error('OpenAI call failed:', error?.message || error)
        if (error?.response) {
            try {
                console.error('OpenAI response status:', error.response.status)
                console.error('OpenAI response data:', JSON.stringify(error.response.data))
            } catch (e) {
                console.error('Failed to serialize error.response.data', e)
            }
        }
        return res.status(500).json({ error: error?.message || 'OpenAI call failed' })
    }
}