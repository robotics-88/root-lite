import * as babylon from '@babylonjs/core'

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
  //single touch - panning
    let panFactor = 0.001
    camera.position.addInPlace(
      camera.getDirection(babylon.Axis.X).scale(-deltaX * panFactor),
    )
    camera.position.addInPlace(
      camera.getDirection(babylon.Axis.Y).scale(deltaY * panFactor),
    )
  }
  else if (touchCount === 2) {
  //two finger touch - zooming
    let touchArray = [...state.activeTouches.values()]
    let newDistance = Math.hypot(
      touchArray[0].x - touchArray[1].x,
      touchArray[0].y - touchArray[1].y,
    )

    if (state.prevDistance !== null) {
      let zoomFactor = 0.005
      let zoomDelta = (newDistance - state.prevDistance) * zoomFactor
      let direction = camera.getDirection(babylon.Axis.Z)
      camera.position.addInPlace(direction.scale(zoomDelta))
    }

    state.prevDistance = newDistance
  }
}