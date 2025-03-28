import { Axis } from '@babylonjs/core/Maths/math.axis'

/**
   * Handles touch move events for both single-touch (panning) and
   * multi-touch (zooming) gestures.
   */
export function handleTouchMove(event, camera, state) {
  if (!state.activeTouches.has(event.pointerId)) return
  let touchCount = state.activeTouches.size
  let prevTouch = state.activeTouches.get(event.pointerId)
  let deltaX = event.clientX - prevTouch.x
  let deltaY = event.clientY - prevTouch.y
  // Update stored touch position
  state.activeTouches.set(event.pointerId, { x: event.clientX, y: event.clientY })

  if (touchCount === 1) {
  //single touch - rotate
   console.log('rotate!!')
    // let panFactor = 0.001
    // camera.position.addInPlace(
    //   camera.getDirection(Axis.X).scale(-deltaX * panFactor),
    // )
    // camera.position.addInPlace(
    //   camera.getDirection(Axis.Y).scale(deltaY * panFactor),
    // )
  }
  else if (touchCount === 2) {
    
  //two finger touch - zooming
    let touchArray = [...state.activeTouches.values()]
    let newDistance = Math.hypot(
      touchArray[0].x - touchArray[1].x,
      touchArray[0].y - touchArray[1].y,
    )
    let zoomThreshold = 2; // Change this value to determine sensitivity for zooming
    if (Math.abs(newDistance - state.prevDistance) > zoomThreshold) {
      // Pinch for zoom
      let zoomFactor = 0.005;
      let zoomDelta = (newDistance - state.prevDistance) * zoomFactor;
      let direction = camera.getDirection(Axis.Z);
      camera.position.addInPlace(direction.scale(zoomDelta));
    }
    else {
     
      // Two-finger move for panning
      let panFactor = 0.01;
      camera.position.addInPlace(camera.getDirection(Axis.X).scale(-deltaX * panFactor));
      camera.position.addInPlace(camera.getDirection(Axis.Y).scale(deltaY * panFactor));
    }

    state.prevDistance = newDistance
  }
}