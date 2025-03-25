let baseCameraRotation = 0

export function initializeRotateTool(canvas, animationController) {
  let camera = animationController.animationTarget
  let rotatable = document.querySelector('#rotatable')
  let rotatableContainer = document.querySelector('#rotatable-container')
  document.querySelector('#rotate-tool-button').addEventListener('click', event => {
    rotatableContainer.classList.toggle('show')
  })
  
  let isDragging = false
  let center = {}

  function updateCenter() {
    const rect = rotatable.getBoundingClientRect()
    center = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    }
  }

  updateCenter() // Get initial center position

  function getAngle(event) {
    const dx = event.clientX - center.x
    const dy = event.clientY - center.y
    return Math.atan2(dy, dx) // Now returns radians instead of degrees
  }

  let startAngle = 0
  let currentRotation = 0

  rotatable.addEventListener('mousedown', (event) => {
    isDragging = true
    startAngle = getAngle(event) - currentRotation // Normalize to 0 radians
    document.addEventListener('mousemove', rotateElement)
    document.addEventListener('mouseup', stopDragging)
  })

  function rotateElement(event) {
    if (!isDragging) return
    const angle = getAngle(event)
    currentRotation = angle - startAngle
    rotatable.style.transform = `rotate(${currentRotation}rad)` // Use radians in CSS
    rotateCamera(currentRotation)
  }

  function stopDragging() {
    isDragging = false
    document.removeEventListener('mousemove', rotateElement)
    document.removeEventListener('mouseup', stopDragging)
  }

  window.addEventListener('resize', updateCenter) // Adjust on window resize

  function rotateCamera(angleRadians) {
    camera.rotation.z = angleRadians
    baseCameraRotation = angleRadians
  }
}

export function getBaseCameraRotation() {
  return baseCameraRotation
}
