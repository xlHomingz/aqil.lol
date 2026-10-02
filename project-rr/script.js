let currentSlide = 1
const totalSlides = 15
let isAnimating = false

function updateSlideCounter() {
  document.getElementById("current-slide").textContent = currentSlide
  document.getElementById("total-slides").textContent = totalSlides
}

function updateProgress() {
  const progress = (currentSlide / totalSlides) * 100
  document.getElementById("progress").style.width = progress + "%"
}

function changeSlide(direction) {
  if (isAnimating) return
  isAnimating = true

  const slides = document.querySelectorAll(".slide")
  const currentSlideElement = slides[currentSlide - 1]

  currentSlideElement.classList.remove("active")
  currentSlideElement.classList.add("prev")

  currentSlide += direction

  if (currentSlide > totalSlides) {
    currentSlide = 1
  } else if (currentSlide < 1) {
    currentSlide = totalSlides
  }

  const nextSlideElement = slides[currentSlide - 1]
  nextSlideElement.classList.remove("prev")
  nextSlideElement.classList.add("active")

  updateSlideCounter()
  updateProgress()

  setTimeout(() => {
    isAnimating = false
  }, 1200)
}

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight" || e.key === " ") {
    e.preventDefault()
    changeSlide(1)
  } else if (e.key === "ArrowLeft") {
    e.preventDefault()
    changeSlide(-1)
  }

  if (
    e.keyCode === 123 ||
    (e.ctrlKey && e.shiftKey && e.keyCode === 73) ||
    (e.ctrlKey && e.shiftKey && e.keyCode === 74) ||
    (e.ctrlKey && e.keyCode === 85)
  ) {
    e.preventDefault()
    return false
  }
})

let touchStartX = 0
let touchEndX = 0
let touchStartY = 0
let touchEndY = 0

document.addEventListener(
  "touchstart",
  (e) => {
    touchStartX = e.changedTouches[0].screenX
    touchStartY = e.changedTouches[0].screenY
  },
  { passive: true },
)

document.addEventListener(
  "touchend",
  (e) => {
    touchEndX = e.changedTouches[0].screenX
    touchEndY = e.changedTouches[0].screenY
    handleSwipe()
  },
  { passive: true },
)

function handleSwipe() {
  const deltaX = touchEndX - touchStartX
  const deltaY = touchEndY - touchStartY
  const minSwipeDistance = 50

  const absX = Math.abs(deltaX)
  const absY = Math.abs(deltaY)


  if (absX > absY * 2 && absX > minSwipeDistance) {
    if (deltaX < 0) {
      changeSlide(1) 
    } else {
      changeSlide(-1) 
    }
  }

}

document.addEventListener("contextmenu", (e) => {
  e.preventDefault()
  return false
})

updateSlideCounter()
updateProgress()
