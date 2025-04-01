
export function handlePointerUp(event, state) {
  if (event.pointerType === 'touch') state.activeTouches.clear()
  else {
    state.isPanning = false
    state.isRotating = false
  }
  
}