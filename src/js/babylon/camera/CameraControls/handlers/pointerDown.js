import { saveCameraState } from '../../cameraHistory'
import * as babylon from '@babylonjs/core'

export function handlePointerDown(event, camera, state) {
  event.preventDefault()

  if (event.pointerType !== 'touch') {
    let pickResult = camera.getScene().pick(event.clientX, event.clientY)

    if (event.button === 0) state.isPanning = true // Left click for panning
    else if (event.button === 2) {
      state.isRotating = true
      
      let intersection = state.octree.findIntersection(pickResult.ray)
      state.rotationCenter = intersection ? intersection.clone() : camera.target.clone()
      // Smoothly transition the target to rotationCenter
      camera.setTarget(babylon.Vector3.Lerp(camera.target, state.rotationCenter, .01))
    } 
  }
  else state.activeTouches.set(event.pointerId, { x: event.clientX, y: event.clientY })

  state.prevX = event.clientX
  state.prevY = event.clientY
  saveCameraState(camera.position.clone(), camera.target.clone())
}