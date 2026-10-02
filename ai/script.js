const CHAT_API_URL = "/api/chat"

let isDark = true
const messages = []
let isLoading = false

const themeToggle = document.getElementById("themeToggle")
const chatForm = document.getElementById("chatForm")
const messageInput = document.getElementById("messageInput")
const sendButton = document.getElementById("sendButton")
const messagesContainer = document.getElementById("messagesContainer")
const emptyState = document.getElementById("emptyState")
const scrollContainer = document.getElementById("scrollContainer")

function initTheme() {
  document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light")
}

function toggleTheme() {
  isDark = !isDark
  document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light")
}

function updateSendButton() {
  sendButton.disabled = !messageInput.value.trim() || isLoading
}

function scrollToBottom() {
  scrollContainer.scrollTop = scrollContainer.scrollHeight
}

function parseMarkdown(text) {
  const container = document.createElement("div")
  container.className = "markdown-content"

  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
  let lastIndex = 0
  let match

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const beforeText = text.slice(lastIndex, match.index)
      const textEl = parseInlineMarkdown(beforeText)
      container.appendChild(textEl)
    }

    const language = match[1] || "text"
    const code = match[2].trim()
    const codeBlock = createCodeBlock(code, language)
    container.appendChild(codeBlock)

    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    const remainingText = text.slice(lastIndex)
    const textEl = parseInlineMarkdown(remainingText)
    container.appendChild(textEl)
  }

  return container
}

function parseInlineMarkdown(text) {
  const container = document.createElement("div")
  const lines = text.split("\n")

  lines.forEach((line) => {
    if (line.trim() === "") {
      container.appendChild(document.createElement("br"))
      return
    }

    const p = document.createElement("p")
    let html = line

    html = html.replace(/`([^`]+)`/g, "<code>$1</code>")
    html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")

    p.innerHTML = html
    container.appendChild(p)
  })

  return container
}

function createCodeBlock(code, language) {
  const block = document.createElement("div")
  block.className = "code-block"

  const header = document.createElement("div")
  header.className = "code-header"

  const lang = document.createElement("span")
  lang.className = "code-language"
  lang.textContent = language

  const copyBtn = document.createElement("button")
  copyBtn.className = "copy-button"
  copyBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
        <span>Kopyala</span>
    `

  copyBtn.addEventListener("click", async () => {
    await navigator.clipboard.writeText(code)
    copyBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span>Kopyalandı</span>
        `
    setTimeout(() => {
      copyBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                <span>Kopyala</span>
            `
    }, 2000)
  })

  header.appendChild(lang)
  header.appendChild(copyBtn)

  const content = document.createElement("div")
  content.className = "code-content"

  const pre = document.createElement("pre")
  const codeEl = document.createElement("code")
  codeEl.textContent = code
  pre.appendChild(codeEl)
  content.appendChild(pre)

  block.appendChild(header)
  block.appendChild(content)

  return block
}

function addMessage(role, content) {
  if (emptyState && emptyState.style.display !== "none") {
    emptyState.style.display = "none"
  }

  const messageDiv = document.createElement("div")
  messageDiv.className = `message ${role}`

  if (role === "assistant") {
    const wrapper = document.createElement("div")
    wrapper.className = "assistant-wrapper"

    const icon = document.createElement("div")
    icon.className = "assistant-icon"
    icon.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
                <path d="M5 3v4"/>
                <path d="M19 17v4"/>
                <path d="M3 5h4"/>
                <path d="M17 19h4"/>
            </svg>
        `

    const contentDiv = document.createElement("div")
    contentDiv.className = "message-content"

    if (content === "loading") {
      const loadingDiv = document.createElement("div")
      loadingDiv.className = "loading-indicator"
      loadingDiv.innerHTML = `
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
            `
      contentDiv.appendChild(loadingDiv)
    } else {
      const parsedContent = parseMarkdown(content)
      contentDiv.appendChild(parsedContent)
    }

    wrapper.appendChild(icon)
    wrapper.appendChild(contentDiv)
    messageDiv.appendChild(wrapper)
  } else {
    const contentDiv = document.createElement("div")
    contentDiv.className = "message-content"
    contentDiv.textContent = content
    messageDiv.appendChild(contentDiv)
  }

  messagesContainer.appendChild(messageDiv)

  requestAnimationFrame(() => {
    scrollToBottom()
  })

  return messageDiv
}

async function handleSubmit(e) {
  e.preventDefault()

  const userInput = messageInput.value.trim()
  if (!userInput || isLoading) return

  messages.push({ role: "user", content: userInput })
  addMessage("user", userInput)

  messageInput.value = ""
  updateSendButton()

  isLoading = true
  const loadingMessage = addMessage("assistant", "loading")

  try {
    const response = await fetch(CHAT_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    })

    const data = await response.json()

    loadingMessage.remove()

    if (data.message) {
      messages.push({ role: "assistant", content: data.message })
      addMessage("assistant", data.message)
    } else if (data.error) {
      addMessage("assistant", `XƏTA: ${data.error}`)
    } else {
      addMessage("assistant", "XƏTA: Cavab alınmadı")
    }
  } catch (error) {
    loadingMessage.remove()
    addMessage("assistant", `XƏTA: ${error.message}`)
  } finally {
    isLoading = false
    updateSendButton()
    messageInput.focus()
  }
}

function handleSuggestionClick(e) {
  const card = e.target.closest(".suggestion-card")
  if (card) {
    const text = card.dataset.text
    messageInput.value = text
    updateSendButton()
    messageInput.focus()
  }
}

themeToggle.addEventListener("click", toggleTheme)
chatForm.addEventListener("submit", handleSubmit)
messageInput.addEventListener("input", updateSendButton)

document.querySelectorAll(".suggestion-card").forEach((card) => {
  card.addEventListener("click", handleSuggestionClick)
})

initTheme()
updateSendButton()
messageInput.focus()
