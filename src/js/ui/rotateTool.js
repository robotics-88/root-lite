// Stores the base rotation of the camera to maintain consistency across interactions
let baseCameraRotation = 0

export function initializeRotateTool(animationController) {
  // Retrieve the target object (camera) from the animation controller
  let camera = animationController.animationTarget
  
  // Get references to the rotatable element and its container
  let rotatable = document.querySelector('#rotatable')
  let rotatableContainer = document.querySelector('#rotatable-container')

  // Toggle visibility of the rotate tool when the button is clicked
  document.querySelector('#rotate-tool-button').addEventListener('click', event => {
    rotatableContainer.classList.toggle('show')
  })

  let center = {}
  let startAngle = null

  updateCenter() // Get initial center position on load

  // Event listener for when the user clicks (mousedown) on the rotatable element
  rotatable.addEventListener('mousedown', (event) => {
    startAngle = getAngle(event) - baseCameraRotation 
    rotatable.addEventListener('mousemove', rotateElement) 
    rotatable.addEventListener('mouseup', stopDragging) 
    rotatable.addEventListener('mouseleave', stopDragging) 
  })

  // Rotates the element based on mouse movement
  function rotateElement(event) {
    let angle = getAngle(event)
    baseCameraRotation = angle - startAngle
    rotatable.style.transform = `rotate(${baseCameraRotation}rad)`
    rotateCamera(baseCameraRotation)
  }

  // Updates the camera's rotation based on the calculated angle
  function rotateCamera(angleRadians) {
    camera.rotation.z = angleRadians // Apply rotation to the camera on the Z-axis
    baseCameraRotation = angleRadians 
  }

  // Calculate the angle in radians based on mouse position relative to the center
  function getAngle(event) {
    let dx = event.clientX - center.x
    let dy = event.clientY - center.y
    return Math.atan2(dy, dx) // Returns the angle in radians
  }

  // Stops the dragging interaction and removes event listeners
  function stopDragging() {
    rotatable.removeEventListener('mousemove', rotateElement)
    rotatable.removeEventListener('mouseup', stopDragging)
    rotatable.removeEventListener('mouseleave', stopDragging)
  }

  // Updates the center position of the rotatable element
  function updateCenter() {
    let rect = rotatable.getBoundingClientRect()
    center = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    }
  }
}

// Provides access to the last known camera rotation angle
export function getBaseCameraRotation() {
  return baseCameraRotation
}
