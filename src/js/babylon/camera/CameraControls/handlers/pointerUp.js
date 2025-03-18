
export function handlePointerUp(event, state) {
  if (event.pointerType === 'touch') state.activeTouches.delete(event.pointerId)
  else {
    state.isPanning = false
    state.isRotating = false
  }
}