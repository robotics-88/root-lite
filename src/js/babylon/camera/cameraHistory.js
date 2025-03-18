let cameraHistory = [] // Stack for storing camera positions and targets

// Function to save the current camera state
export function saveCameraState(position, target) {
  cameraHistory.push({
    position,
    target,
  })
  // Keep history size reasonable (e.g., last 20 moves)
  if (cameraHistory.length > 10) {
    cameraHistory.shift()
  }
}

// Function to undo last move
export function undoCameraMove(camera) {
 
  if (cameraHistory.length > 0) {

    let lastState = cameraHistory.pop()
    // console.log(lastState)
    camera.position.copyFrom(lastState.position)
    camera.setTarget(lastState.target.clone())
  }
}
