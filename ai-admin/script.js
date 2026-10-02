let isDark = true
const messages = []
const debugLogs = []
let isLoading = false

const themeToggle = document.getElementById("themeToggle")
const chatForm = document.getElementById("chatForm")
const messageInput = document.getElementById("messageInput")
const sendButton = document.getElementById("sendButton")
const messagesContainer = document.getElementById("messagesContainer")
const emptyState = document.getElementById("emptyState")
const debugContent = document.getElementById("debugContent")
const debugEmpty = document.getElementById("debugEmpty")
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

function scrollDebugToBottom() {
  debugContent.scrollTop = debugContent.scrollHeight
}

function addDebugLog(type, data) {
  const timestamp = new Date().toLocaleTimeString("az-AZ")

  if (debugEmpty && debugEmpty.style.display !== "none") {
    debugEmpty.style.display = "none"
  }

  const logDiv = document.createElement("div")
  logDiv.className = `debug-log ${type}`

  const header = document.createElement("div")
  header.className = "debug-log-header"

  let iconSvg = ""
  if (type === "error") {
    iconSvg =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
  } else if (type === "request") {
    iconSvg =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>'
  } else {
    iconSvg =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
  }

  header.innerHTML = `
        ${iconSvg}
        <span class="debug-log-type">${type}</span>
        <span class="debug-log-time">${timestamp}</span>
    `

  const dataDiv = document.createElement("div")
  dataDiv.className = "debug-log-data"
  dataDiv.textContent = JSON.stringify(data, null, 2)

  logDiv.appendChild(header)
  logDiv.appendChild(dataDiv)

  debugContent.appendChild(logDiv)

  requestAnimationFrame(() => {
    scrollDebugToBottom()
  })
}

function parseMarkdown(text) {
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

function addMessage(role, content, isError = false) {
  if (emptyState && emptyState.style.display !== "none") {
    emptyState.style.display = "none"
  }

  const messageDiv = document.createElement("div")
  messageDiv.className = `message ${role}${isError ? " error" : ""}`

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
  } else if (role === "assistant" && !isError) {
    const parsedContent = parseMarkdown(content)
    contentDiv.appendChild(parsedContent)
  } else {
    contentDiv.textContent = content
  }

  messageDiv.appendChild(contentDiv)
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

  const requestPayload = { messages }
  addDebugLog("request", requestPayload)

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestPayload),
    })

    const data = await response.json()

    addDebugLog("response", {
      status: response.status,
      statusText: response.statusText,
      data: data,
    })

    loadingMessage.remove()

    if (data.error) {
      addDebugLog("error", {
        message: data.error,
        fullResponse: data,
      })
      addMessage("assistant", `XƏTA: ${data.error}`, true)
    } else if (data.message) {
      messages.push({ role: "assistant", content: data.message })
      addMessage("assistant", data.message)
    }
  } catch (error) {
    loadingMessage.remove()

    const errorData = {
      message: error.message,
      error: error,
    }

    addDebugLog("error", errorData)
    addMessage("assistant", `XƏTA: ${error.message}`, true)
  } finally {
    isLoading = false
    updateSendButton()
    messageInput.focus()
  }
}

themeToggle.addEventListener("click", toggleTheme)
chatForm.addEventListener("submit", handleSubmit)
messageInput.addEventListener("input", updateSendButton)

initTheme()
updateSendButton()
messageInput.focus()
