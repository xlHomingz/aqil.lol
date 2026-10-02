const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"
const MAX_MESSAGES = 50
const MAX_CONTENT_LENGTH = 8000

const SYSTEM_PROMPT =
  "Sən Azərbaycan dilində danışan köməkçisən. Bütün cavablarını yalnız Azərbaycan dilində ver. Heç vaxt ingilis, türk və ya başqa dildə cavab vermə. Həmişə Azərbaycan dilində cavab ver."

function sanitizeMessages(input) {
  if (!Array.isArray(input)) return null
  const cleaned = input
    .filter(
      (m) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0,
    )
    .slice(-MAX_MESSAGES)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CONTENT_LENGTH) }))
  return cleaned.length > 0 ? cleaned : null
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST")
    return res.status(405).json({ error: "Method not allowed" })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: "OPENAI_API_KEY is not configured" })
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {}
  const messages = sanitizeMessages(body.messages)
  if (!messages) {
    return res.status(400).json({ error: "Invalid messages" })
  }

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    })

    const data = await response.json()
    const content = data?.choices?.[0]?.message?.content

    if (!response.ok || !content) {
      return res
        .status(response.ok ? 502 : response.status)
        .json({ error: data?.error?.message || "Cavab alınmadı" })
    }

    return res.status(200).json({ message: content })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
