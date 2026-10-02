const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches

document.addEventListener("contextmenu", (e) => {
  if (e.target.tagName === "IMG") e.preventDefault()
})

for (const type of ["touchstart", "touchend", "touchmove"]) {
  document.addEventListener(
    type,
    (e) => {
      if (e.target.tagName === "IMG") e.preventDefault()
    },
    { passive: false },
  )
}

const toast = document.querySelector(".toast")
let toastTimer

function showToast(message) {
  if (!toast) return
  toast.textContent = message
  toast.classList.add("is-visible")
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2200)
}

function rejectLocked(item) {
  const frame = item.querySelector(".image-frame")
  frame.classList.remove("is-shaking")
  void frame.offsetWidth
  frame.classList.add("is-shaking")
  const name = item.querySelector(".username")?.textContent.trim()
  showToast(`${name} hazırda arxivdədir`)
}

document.querySelectorAll(".portfolio-item:not(.is-empty)").forEach((item) => {
  const link = item.querySelector(".image-link")
  const frame = item.querySelector(".image-frame")

  if (item.classList.contains("is-locked")) {
    link.addEventListener("click", () => rejectLocked(item))
    link.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        rejectLocked(item)
      }
    })
    frame.addEventListener("animationend", () => frame.classList.remove("is-shaking"))
  }

  if (!finePointer || prefersReducedMotion) return

  link.addEventListener("pointermove", (e) => {
    const rect = link.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    link.style.setProperty("--ry", `${x * 14}deg`)
    link.style.setProperty("--rx", `${y * -14}deg`)
    link.style.setProperty("--mx", `${(x + 0.5) * 100}%`)
    link.style.setProperty("--my", `${(y + 0.5) * 100}%`)
  })
  link.addEventListener("pointerleave", () => {
    link.style.setProperty("--rx", "0deg")
    link.style.setProperty("--ry", "0deg")
  })
})

const VERTEX_SHADER = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`

const FRAGMENT_SHADER = `
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_mouse;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = m * p;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  vec2 m = (u_mouse - 0.5) * vec2(u_res.x / u_res.y, 1.0);
  float t = u_time * 0.035;

  vec2 q = vec2(fbm(p * 1.3 + t), fbm(p * 1.3 + vec2(5.2, 1.3) - t));
  vec2 r = vec2(
    fbm(p * 1.7 + 3.2 * q + vec2(1.7, 9.2) + t * 1.4 + m * 0.25),
    fbm(p * 1.7 + 3.2 * q + vec2(8.3, 2.8) - t * 1.1 - m * 0.25)
  );
  float f = fbm(p * 1.5 + 2.6 * r);

  vec3 base = vec3(0.0, 0.0, 0.004);
  vec3 navy = vec3(0.008, 0.012, 0.04);
  vec3 violet = vec3(0.16, 0.04, 0.3);
  vec3 crimson = vec3(0.3, 0.03, 0.08);
  vec3 pink = vec3(0.6, 0.2, 0.42);

  vec3 col = base;
  col = mix(col, navy, smoothstep(0.25, 0.9, f));
  col = mix(col, violet, smoothstep(0.7, 1.15, length(q)) * 0.45);
  col = mix(col, crimson, smoothstep(0.65, 1.0, r.x) * 0.3);
  col += pink * pow(smoothstep(0.65, 1.0, f), 4.0) * 0.18;

  float md = length(p - m);
  col += mix(violet, pink, 0.5) * 0.08 * exp(-md * md * 6.0);

  float topGlow = exp(-pow((uv.y - 1.08) * 2.6, 2.0)) * smoothstep(0.95, 0.0, abs(p.x));
  col += violet * topGlow * 0.25;

  float vig = smoothstep(1.25, 0.2, length(p * vec2(0.85, 1.15)));
  col *= mix(0.12, 1.0, vig);
  col *= 0.45 + 0.55 * smoothstep(-0.55, 0.45, p.y);

  col += (hash(gl_FragCoord.xy + fract(u_time)) - 0.5) / 255.0;
  gl_FragColor = vec4(col, 1.0);
}
`

function compileShader(gl, type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function startShaderBackground(canvas) {
  const gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" })
  if (!gl) return false

  const vertex = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER)
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER)
  if (!vertex || !fragment) return false

  const program = gl.createProgram()
  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return false
  gl.useProgram(program)

  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const position = gl.getAttribLocation(program, "a_pos")
  gl.enableVertexAttribArray(position)
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

  const uRes = gl.getUniformLocation(program, "u_res")
  const uTime = gl.getUniformLocation(program, "u_time")
  const uMouse = gl.getUniformLocation(program, "u_mouse")

  const RENDER_SCALE = 0.5
  const mouse = { x: 0.5, y: 0.62, tx: 0.5, ty: 0.62 }
  const timeOffset = Math.random() * 400
  let frameId = 0

  const resize = () => {
    canvas.width = Math.max(1, Math.round(window.innerWidth * RENDER_SCALE))
    canvas.height = Math.max(1, Math.round(window.innerHeight * RENDER_SCALE))
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.uniform2f(uRes, canvas.width, canvas.height)
  }

  const render = (now) => {
    mouse.x += (mouse.tx - mouse.x) * 0.04
    mouse.y += (mouse.ty - mouse.y) * 0.04
    gl.uniform1f(uTime, timeOffset + now / 1000)
    gl.uniform2f(uMouse, mouse.x, mouse.y)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }

  const loop = (now) => {
    render(now)
    frameId = requestAnimationFrame(loop)
  }

  resize()
  window.addEventListener("resize", () => {
    resize()
    if (prefersReducedMotion) render(0)
  })

  if (prefersReducedMotion) {
    render(0)
  } else {
    window.addEventListener("pointermove", (e) => {
      mouse.tx = e.clientX / window.innerWidth
      mouse.ty = 1 - e.clientY / window.innerHeight
    })
    document.addEventListener("visibilitychange", () => {
      cancelAnimationFrame(frameId)
      if (!document.hidden) frameId = requestAnimationFrame(loop)
    })
    frameId = requestAnimationFrame(loop)
  }

  return true
}

const canvas = document.querySelector(".bg-canvas")

if (canvas && startShaderBackground(canvas)) {
  document.documentElement.classList.add("has-shader")
  requestAnimationFrame(() => canvas.classList.add("is-ready"))
}
