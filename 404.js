const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
const finePointer = window.matchMedia("(pointer: fine)").matches
const root = document.documentElement

const clock = document.querySelector("[data-clock]")
const tick = () => {
  clock.textContent = new Date().toLocaleTimeString("az-AZ", { hour12: false })
}
tick()
setInterval(tick, 1000)

document.querySelector("[data-back]").addEventListener("click", () => {
  if (history.length > 1 && document.referrer) {
    history.back()
  } else {
    location.href = "/"
  }
})

if (finePointer && !reducedMotion) {
  window.addEventListener("pointermove", (e) => {
    root.style.setProperty("--mx", ((e.clientX / window.innerWidth) * 2 - 1).toFixed(3))
    root.style.setProperty("--my", ((e.clientY / window.innerHeight) * 2 - 1).toFixed(3))
  })
}

const terminal = document.querySelector("[data-terminal]")
const requestedPath = decodeURIComponent(location.pathname) || "/"

const lines = [
  { type: "", parts: [{ text: "GET " }, { text: requestedPath, cls: "nf-path" }] },
  { type: "", parts: [{ text: "Marşrut axtarılır..." }] },
  { type: "err", parts: [{ text: "Xəta 404: səhifə tapılmadı" }] },
  { type: "ok", parts: [{ text: "Təhlükəsiz marşrut tapıldı: /" }] },
]

const makeLine = (type) => {
  const line = document.createElement("div")
  line.className = `nf-line${type ? ` nf-line--${type}` : ""}`
  const prompt = document.createElement("span")
  prompt.className = "nf-prompt"
  prompt.textContent = type === "err" ? "!" : type === "ok" ? "+" : ">"
  const msg = document.createElement("span")
  msg.className = "nf-msg"
  line.append(prompt, msg)
  terminal.append(line)
  return msg
}

const caret = document.createElement("span")
caret.className = "nf-caret"

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const typeLines = async () => {
  for (const { type, parts } of lines) {
    const msg = makeLine(type)
    for (const part of parts) {
      const span = document.createElement("span")
      if (part.cls) span.className = part.cls
      msg.append(span)
      if (reducedMotion) {
        span.textContent = part.text
        continue
      }
      msg.append(caret)
      for (const char of part.text) {
        span.textContent += char
        await sleep(18 + Math.random() * 30)
      }
    }
    msg.append(caret)
    if (!reducedMotion) await sleep(380)
  }
}

const REDIRECT_SECONDS = 15
const fill = document.querySelector("[data-progress]")
const progressBar = fill.parentElement
const secondsEl = document.querySelector("[data-seconds]")
const label = document.querySelector("[data-redirect-label]")
const cancelBtn = document.querySelector("[data-cancel]")
let redirectFrame = 0
let cancelled = false

const startRedirect = () => {
  const start = performance.now()
  const step = (now) => {
    if (cancelled) return
    const elapsed = (now - start) / 1000
    const ratio = Math.min(elapsed / REDIRECT_SECONDS, 1)
    fill.style.transform = `scaleX(${ratio})`
    progressBar.setAttribute("aria-valuenow", Math.round(ratio * 100))
    secondsEl.textContent = Math.max(0, Math.ceil(REDIRECT_SECONDS - elapsed))
    if (ratio >= 1) {
      location.href = "/"
      return
    }
    redirectFrame = requestAnimationFrame(step)
  }
  redirectFrame = requestAnimationFrame(step)
}

cancelBtn.addEventListener("click", () => {
  cancelled = true
  cancelAnimationFrame(redirectFrame)
  label.textContent = "Avtomatik yönləndirmə dayandırıldı"
  cancelBtn.hidden = true
})

typeLines()
startRedirect()

const canvas = document.querySelector(".nf-warp")
const ctx = canvas.getContext("2d")
const STAR_COUNT = 260
const colors = ["255,255,255", "255,105,180", "150,110,255", "110,231,255"]
let stars = []
let width = 0
let height = 0
let speed = 0.6
let targetSpeed = 0.6
let warpFrame = 0
const center = { x: 0, y: 0, tx: 0, ty: 0 }

const makeStar = (randomDepth = true) => ({
  x: (Math.random() - 0.5) * 2,
  y: (Math.random() - 0.5) * 2,
  z: randomDepth ? Math.random() : 1,
  pz: 0,
  color: colors[Math.random() < 0.7 ? 0 : 1 + Math.floor(Math.random() * 3)],
})

const resize = () => {
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  width = window.innerWidth
  height = window.innerHeight
  canvas.width = width * dpr
  canvas.height = height * dpr
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  center.x = center.tx = width / 2
  center.y = center.ty = height / 2.4
}

const drawStars = () => {
  ctx.fillStyle = "rgba(0, 0, 0, 0.35)"
  ctx.globalCompositeOperation = "destination-out"
  ctx.fillRect(0, 0, width, height)
  ctx.globalCompositeOperation = "lighter"

  speed += (targetSpeed - speed) * 0.05
  center.x += (center.tx - center.x) * 0.05
  center.y += (center.ty - center.y) * 0.05
  const scale = Math.max(width, height) * 0.5

  for (const star of stars) {
    star.pz = star.z
    star.z -= 0.0035 * speed
    if (star.z <= 0.02) {
      Object.assign(star, makeStar(false))
      star.pz = star.z
      continue
    }
    const sx = center.x + (star.x / star.z) * scale
    const sy = center.y + (star.y / star.z) * scale
    const px = center.x + (star.x / star.pz) * scale
    const py = center.y + (star.y / star.pz) * scale
    if (sx < -50 || sx > width + 50 || sy < -50 || sy > height + 50) {
      Object.assign(star, makeStar(false))
      continue
    }
    const alpha = Math.min(1, (1 - star.z) * 1.4)
    ctx.strokeStyle = `rgba(${star.color}, ${alpha})`
    ctx.lineWidth = Math.max(0.4, (1 - star.z) * 2.2)
    ctx.beginPath()
    ctx.moveTo(px, py)
    ctx.lineTo(sx, sy)
    ctx.stroke()
  }
  ctx.globalCompositeOperation = "source-over"
}

const loop = () => {
  drawStars()
  warpFrame = requestAnimationFrame(loop)
}

resize()
stars = Array.from({ length: STAR_COUNT }, () => makeStar())
window.addEventListener("resize", resize)

if (reducedMotion) {
  for (let i = 0; i < 3; i++) drawStars()
} else {
  window.addEventListener("pointermove", (e) => {
    center.tx = width / 2 + (e.clientX - width / 2) * 0.15
    center.ty = height / 2.4 + (e.clientY - height / 2) * 0.15
  })
  document.querySelectorAll(".nf-btn").forEach((btn) => {
    btn.addEventListener("pointerenter", () => {
      targetSpeed = 4
    })
    btn.addEventListener("pointerleave", () => {
      targetSpeed = 0.6
    })
  })
  document.addEventListener("visibilitychange", () => {
    cancelAnimationFrame(warpFrame)
    if (!document.hidden) loop()
  })
  loop()
    }
