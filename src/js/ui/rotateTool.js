// Stores the base rotation of the camera to maintain consistency across interactions
let baseCameraRotation = 1.829327364167595 //set to default for house.ply

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

  // MOUSE EVENTS
  rotatable.addEventListener('mousedown', (event) => {
    startAngle = getAngle(event) - baseCameraRotation 
    document.addEventListener('mousemove', rotateElement)
    document.addEventListener('mouseup', stopDragging)
    document.addEventListener('mouseleave', stopDragging) // Added back!
  })

  // TOUCH EVENTS
  rotatable.addEventListener('touchstart', (event) => {
    event.preventDefault() // Prevent scrolling
    if (event.touches.length === 1) { // Single touch only
      startAngle = getAngle(event.touches[0]) - baseCameraRotation 
      document.addEventListener('touchmove', handleTouchMove)
      document.addEventListener('touchend', stopDragging)
      document.addEventListener('touchcancel', stopDragging) // Handles interruptions
    }
  })

  // Rotates the element based on mouse movement
  function rotateElement(event) {
    let angle = getAngle(event)
    baseCameraRotation = angle - startAngle
    rotatable.style.transform = `rotate(${baseCameraRotation}rad)`
    rotateCamera(baseCameraRotation)
  }

  // Handles touchmove, normalizing to use the first touch
  function handleTouchMove(event) {
    event.preventDefault() // Prevent default gestures
    if (event.touches.length === 1) {
      rotateElement(event.touches[0])
    }
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

  // Stops dragging interaction
  function stopDragging() {
    document.removeEventListener('mousemove', rotateElement)
    document.removeEventListener('mouseup', stopDragging)
    document.removeEventListener('mouseleave', stopDragging) // Ensure mouseleave stops rotation
    document.removeEventListener('touchmove', handleTouchMove)
    document.removeEventListener('touchend', stopDragging)
    document.removeEventListener('touchcancel', stopDragging) // Handles cases like browser gestures
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
