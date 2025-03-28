import { saveCameraState } from '../../cameraHistory'
import { Axis } from '@babylonjs/core/Maths/math.axis'

/**
   * Handles touch move events for both single-touch (panning) and
   * multi-touch (zooming) gestures.
   */
export function handleWheel(event, camera, state) {
  
  event.preventDefault()
      
  let zoomFactor = -0.001
  let direction = camera.getDirection(Axis.Z)
  camera.position.addInPlace(direction.scale(event.deltaY * zoomFactor))

  // Clear previous timeout and set a new one
  // This a workaround for there not being a wheelEnd event - this prevents 
  // too many saveCameraStates being called from the repeated firings of the wheel event
  clearTimeout(state.wheelTimeout)
  state.wheelTimeout = setTimeout(() => {
    saveCameraState(camera.position.clone(), camera.target.clone())
  }, 500)
}