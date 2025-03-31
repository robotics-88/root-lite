import { undoCameraMove } from '../../cameraHistory'

export function handleKeyDown(event, camera) {
  if (event.key === 'b') {
    undoCameraMove(camera)
  }
}