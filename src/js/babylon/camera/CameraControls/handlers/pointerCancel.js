export function handlePointerCancel(event, state) {
  state.activeTouches.delete(event.pointerId)
}