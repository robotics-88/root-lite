import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { Quaternion } from '@babylonjs/core/Maths'
import { Axis } from '@babylonjs/core/Maths/math.axis'
import { handleTouchMove } from './touchMove'
import { getBaseCameraRotation } from '../../../../ui/rotateTool'

export function handlePointerMove(event, camera, state) {
  
  if (event.pointerType === 'touch') {
    handleTouchMove(event, camera, state)
    return
  }
  if (!state.isPanning && !state.isRotating) return

  let deltaX = event.clientX - state.prevX
  let deltaY = event.clientY - state.prevY
  state.prevX = event.clientX
  state.prevY = event.clientY

  if (state.isPanning) {
  // Adjust camera position based on movement
    let panFactor = 0.0015 //adjust to change panning speed
    camera.position.addInPlace(
      camera.getDirection(Axis.X).scale(-deltaX * panFactor),
    )
    camera.position.addInPlace(
      camera.getDirection(Axis.Y).scale(deltaY * panFactor),
    )
  }
  else if (state.isRotating) {
    let rotateFactor = 0.001
      
    // --------- ORBIT ROTATION (Around a close target) -
    let direction = camera.position.subtract(state.rotationCenter)
    let radius = direction.length() // Maintain distance

    // Convert camera's rotation quaternion to local basis vectors
    let right = camera.getDirection(Axis.X)
    let up = camera.getDirection(Axis.Y)

    // Reverse x and y rotations for grab-and-drag feel
    let yaw = deltaX * rotateFactor // Negative for natural drag
    let pitch = deltaY * rotateFactor // Negative for natural drag

    // Create rotation quaternions relative to the camera’s local axes
    let yawQuat = Quaternion.RotationAxis(up, yaw)
    let pitchQuat = Quaternion.RotationAxis(right, pitch)

    // Apply rotations
    let finalRotation = yawQuat.multiply(pitchQuat)
    direction = direction.applyRotationQuaternion(finalRotation)

    // Keep camera at a fixed distance
    direction.normalize().scaleInPlace(radius)
    let newPosition = state.rotationCenter.add(direction)

    // Gradually move target until it's close enough
    let newTarget = Vector3.Lerp(camera.target, state.rotationCenter, 0.1)

    // Lock target when close enough
    if (Vector3.Distance(newTarget, state.rotationCenter) < 0.01) newTarget = state.rotationCenter
    
    camera.setTarget(newTarget)

    // Apply the new position
    camera.position = newPosition
  }
  camera.rotation.z = getBaseCameraRotation()
}