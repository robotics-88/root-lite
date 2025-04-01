import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { Quaternion } from '@babylonjs/core/Maths'
import { Axis } from '@babylonjs/core/Maths/math.axis'

export function rotateCamera(camera, { rotationCenter }, deltaX, deltaY){
  let rotateFactor = 0.001
  let direction = camera.position.subtract(rotationCenter)
  let radius = direction.length() // Maintain distance
    
  // Convert camera's rotation quaternion to local basis vectors
  let right = camera.getDirection(Axis.X)
  let up = camera.getDirection(Axis.Y)
    
  let yaw = deltaX * rotateFactor 
  let pitch = deltaY * rotateFactor 
    
  // Create rotation quaternions relative to the camera’s local axes
  let yawQuat = Quaternion.RotationAxis(up, yaw)
  let pitchQuat = Quaternion.RotationAxis(right, pitch)
    
  // Apply rotations
  let finalRotation = yawQuat.multiply(pitchQuat)
  direction = direction.applyRotationQuaternion(finalRotation)
    
  // Keep camera at a fixed distance
  direction.normalize().scaleInPlace(radius)
  let newPosition = rotationCenter.add(direction)
    
  // Gradually move target until it's close enough
  let newTarget = Vector3.Lerp(camera.target, rotationCenter, 0.1)
    
  // Lock target when close enough
  if (Vector3.Distance(newTarget, rotationCenter) < 0.01) newTarget = rotationCenter
        
  camera.setTarget(newTarget)
    
  // Apply the new position
  camera.position = newPosition
}

export function setCameraFocus(camera, ray, state) {
  let intersection = state.octree.findIntersection(ray)
  state.rotationCenter = intersection ? intersection.clone() : camera.target.clone()
      
  // Smoothly transition the target to rotationCenter
  camera.setTarget(Vector3.Lerp(camera.target, state.rotationCenter, .01))
}