const softMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches
const root = document.documentElement
const body = document.body

const clock = document.querySelector("[data-clock]")
const tick = () => {
  const now = new Date()
  clock.textContent = [now.getHours(), now.getMinutes(), now.getSeconds()]
    .map((n) => String(n).padStart(2, "0"))
    .join(":")
}
tick()
setInterval(tick, 1000)

const parallax = { x: 0, y: 0, tx: 0, ty: 0, tiltX: 0, tiltY: 0, active: 0 }

const setTarget = (clientX, clientY) => {
  parallax.tx = (clientX / window.innerWidth) * 2 - 1
  parallax.ty = (clientY / window.innerHeight) * 2 - 1
  parallax.active = performance.now()
}

window.addEventListener("pointermove", (e) => setTarget(e.clientX, e.clientY), { passive: true })
window.addEventListener("touchmove", (e) => {
  const t = e.touches[0]
  if (t) setTarget(t.clientX, t.clientY)
}, { passive: true })

if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission !== "function") {
  window.addEventListener("deviceorientation", (e) => {
    if (e.beta == null || e.gamma == null) return
    parallax.tiltX = Math.max(-1, Math.min(1, e.gamma / 30))
    parallax.tiltY = Math.max(-1, Math.min(1, (e.beta - 45) / 30))
  }, { passive: true })
}

const canvas = document.querySelector(".nf-warp")
const ctx = canvas.getContext("2d")
const colors = ["255,255,255", "255,105,180", "150,110,255", "110,231,255"]
const BASE_SPEED = softMotion ? 0.35 : 0.7
let stars = []
let width = 0
let height = 0
let speed = BASE_SPEED
let boostUntil = 0
let boostLevel = 0
const center = { x: 0, y: 0 }

const makeStar = (randomDepth = true) => ({
  x: (Math.random() - 0.5) * 2,
  y: (Math.random() - 0.5) * 2,
  z: randomDepth ? Math.random() : 1,
  pz: 1,
  color: colors[Math.random() < 0.7 ? 0 : 1 + Math.floor(Math.random() * 3)],
})

const resize = () => {
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  width = window.innerWidth
  height = window.innerHeight
  canvas.width = Math.round(width * dpr)
  canvas.height = Math.round(height * dpr)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  center.x = width / 2
  center.y = height / 2.4
  const count = Math.round(Math.min(260, Math.max(120, (width * height) / 2200)))
  if (stars.length !== count) {
    stars = Array.from({ length: count }, () => makeStar())
  }
}

const boost = (level, ms) => {
  boostLevel = Math.max(boostLevel, level)
  boostUntil = Math.max(boostUntil, performance.now() + ms)
}

const drawStars = (dt, now) => {
  ctx.globalCompositeOperation = "destination-out"
  ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(0.6, 0.3 * dt)})`
  ctx.fillRect(0, 0, width, height)
  ctx.globalCompositeOperation = "lighter"

  if (now > boostUntil) boostLevel = 0
  const target = BASE_SPEED + boostLevel
  speed += (target - speed) * Math.min(1, 0.06 * dt)

  const cx = center.x + parallax.x * width * 0.08
  const cy = center.y + parallax.y * height * 0.08
  const scale = Math.max(width, height) * 0.5

  for (const star of stars) {
    star.pz = star.z
    star.z -= 0.0035 * speed * dt
    if (star.z <= 0.02) {
      Object.assign(star, makeStar(false))
      continue
    }
    const sx = cx + (star.x / star.z) * scale
    const sy = cy + (star.y / star.z) * scale
    if (sx < -60 || sx > width + 60 || sy < -60 || sy > height + 60) {
      Object.assign(star, makeStar(false))
      continue
    }
    const px = cx + (star.x / star.pz) * scale
    const py = cy + (star.y / star.pz) * scale
    const depth = 1 - star.z
    ctx.strokeStyle = `rgba(${star.color}, ${Math.min(1, depth * 1.4)})`
    ctx.lineWidth = Math.max(0.5, depth * 2.2)
    ctx.beginPath()
    ctx.moveTo(px, py)
    ctx.lineTo(sx, sy)
    ctx.stroke()
  }
  ctx.globalCompositeOperation = "source-over"
}

let last = performance.now()
let frame = 0

const loop = (now) => {
  const dt = Math.min(3, (now - last) / 16.667)
  last = now

  const idle = now - parallax.active > 2500
  const t = now / 1000
  const driftX = Math.sin(t * 0.45) * 0.35 + parallax.tiltX * 0.6
  const driftY = Math.cos(t * 0.33) * 0.25 + parallax.tiltY * 0.6
  const goalX = idle ? driftX : parallax.tx
  const goalY = idle ? driftY : parallax.ty
  const ease = Math.min(1, 0.06 * dt)
  parallax.x += (goalX - parallax.x) * ease
  parallax.y += (goalY - parallax.y) * ease
  root.style.setProperty("--mx", parallax.x.toFixed(4))
  root.style.setProperty("--my", parallax.y.toFixed(4))

  drawStars(dt, now)
  frame = requestAnimationFrame(loop)
}

resize()
window.addEventListener("resize", resize)
document.addEventListener("visibilitychange", () => {
  cancelAnimationFrame(frame)
  if (!document.hidden) {
    last = performance.now()
    frame = requestAnimationFrame(loop)
  }
})
frame = requestAnimationFrame(loop)

setInterval(() => {
  if (!document.hidden && !body.classList.contains("is-leaving")) boost(softMotion ? 1.5 : 3.5, 1100)
}, 9000)

const ripples = document.querySelector(".nf-ripples")
window.addEventListener("pointerdown", (e) => {
  const dot = document.createElement("span")
  dot.className = "nf-ripple"
  dot.style.left = `${e.clientX}px`
  dot.style.top = `${e.clientY}px`
  dot.addEventListener("animationend", () => dot.remove())
  ripples.append(dot)
  boost(2.5, 500)
}, { passive: true })

document.querySelectorAll(".nf-btn").forEach((btn) => {
  btn.addEventListener("pointerenter", () => boost(3, 100000))
  btn.addEventListener("pointerleave", () => {
    boostUntil = performance.now()
  })
})

if (finePointer) {
  document.querySelectorAll("[data-magnet]").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect()
      const x = (e.clientX - r.left - r.width / 2) / r.width
      const y = (e.clientY - r.top - r.height / 2) / r.height
      el.style.setProperty("--bx", `${(x * 14).toFixed(2)}px`)
      el.style.setProperty("--by", `${(y * 10).toFixed(2)}px`)
    })
    el.addEventListener("pointerleave", () => {
      el.style.setProperty("--bx", "0px")
      el.style.setProperty("--by", "0px")
    })
  })
}

const SCRAMBLE_CHARS = "!<>-_\\/[]{}=+*^?#01"
const scramble = (el) => {
  const text = el.textContent
  const total = text.length
  const start = performance.now()
  const duration = softMotion ? 500 : 1100
  el.setAttribute("aria-label", text)
  const step = (now) => {
    const progress = Math.min(1, (now - start) / duration)
    const revealed = Math.floor(progress * total)
    let out = ""
    for (let i = 0; i < total; i++) {
      const ch = text[i]
      if (i < revealed || ch === " ") out += ch
      else out += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
    }
    el.textContent = out
    if (progress < 1) requestAnimationFrame(step)
    else el.textContent = text
  }
  requestAnimationFrame(step)
}

const scrambleEl = document.querySelector("[data-scramble]")
setTimeout(() => scramble(scrambleEl), 350)

const terminal = document.querySelector("[data-terminal]")
let requestedPath = "/"
try {
  requestedPath = decodeURIComponent(location.pathname) || "/"
} catch {
  requestedPath = location.pathname || "/"
}

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
  await sleep(900)
  for (const { type, parts } of lines) {
    const msg = makeLine(type)
    for (const part of parts) {
      const span = document.createElement("span")
      if (part.cls) span.className = part.cls
      msg.append(span, caret)
      for (const char of part.text) {
        span.textContent += char
        await sleep(softMotion ? 8 : 18 + Math.random() * 30)
      }
    }
    msg.append(caret)
    await sleep(softMotion ? 150 : 380)
  }
}

let leaving = false
const leave = (url) => {
  if (leaving) return
  leaving = true
  cancelled = true
  boost(12, 100000)
  body.classList.add("is-leaving")
  setTimeout(() => {
    location.href = url
  }, 750)
}

window.addEventListener("pageshow", (e) => {
  if (e.persisted) {
    leaving = false
    body.classList.remove("is-leaving")
    boostUntil = 0
  }
})

document.querySelectorAll("[data-leave]").forEach((link) => {
  link.addEventListener("click", (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return
    e.preventDefault()
    leave(link.getAttribute("href"))
  })
})

const REDIRECT_SECONDS = 15
const fill = document.querySelector("[data-progress]")
const progressBar = fill.parentElement
const secondsEl = document.querySelector("[data-seconds]")
const label = document.querySelector("[data-redirect-label]")
const cancelBtn = document.querySelector("[data-cancel]")
let cancelled = false
let elapsed = 0
let lastTick = performance.now()

const redirectStep = (now) => {
  if (cancelled) return
  if (!document.hidden) elapsed += (now - lastTick) / 1000
  lastTick = now
  const ratio = Math.min(elapsed / REDIRECT_SECONDS, 1)
  fill.style.transform = `scaleX(${ratio})`
  progressBar.setAttribute("aria-valuenow", String(Math.round(ratio * 100)))
  secondsEl.textContent = String(Math.max(0, Math.ceil(REDIRECT_SECONDS - elapsed)))
  if (ratio >= 1) {
    leave("/")
    return
  }
  requestAnimationFrame(redirectStep)
}

cancelBtn.addEventListener("click", () => {
  cancelled = true
  label.textContent = "Avtomatik yönləndirmə dayandırıldı"
  cancelBtn.hidden = true
})

document.addEventListener("visibilitychange", () => {
  lastTick = performance.now()
})

typeLines()
requestAnimationFrame((now) => {
  lastTick = now
  redirectStep(now)
})
