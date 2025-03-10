import * as babylon from '@babylonjs/core'

/**
 * Adds animations to the given camera based on a list of positions.
 */
export function addAnimations(positions, camera) {
  // If new positions exist, apply them to the camera
  //turned off for dev, condition should be: positions.length > 0
  if (false){
    let startPosition = positions[0].location
    let startRotation = positions[0].rotation

    camera.position = startPosition
    camera.rotationQuaternion = startRotation

    let { positionAnimation, rotationAnimation } = createAnimations(positions)

    // Attach animations to the camera
    camera.animations.push(positionAnimation)
    camera.animations.push(rotationAnimation)
  }
}

/**
 * Creates animations for the camera's position and rotation.
 */
function createAnimations(positions) {
  // Create position animation
  let positionAnimation = new babylon.Animation(
    'cameraPositionAnimation',
    'position',
    30, // Frames per second (FPS)
    babylon.Animation.ANIMATIONTYPE_VECTOR3,
    babylon.Animation.ANIMATIONLOOPMODE_CYCLE
  )

  // Create rotation animation
  let rotationAnimation = new babylon.Animation(
    'cameraRotationAnimation',
    'rotationQuaternion',
    30, // FPS
    babylon.Animation.ANIMATIONTYPE_QUATERNION,
    babylon.Animation.ANIMATIONLOOPMODE_CYCLE
  )

  // Generate keyframes for position and rotation
  let { positionKeys, rotationKeys } = createKeys(positions)

  // Set keyframes to animations
  positionAnimation.setKeys(positionKeys)
  rotationAnimation.setKeys(rotationKeys)

  // Apply easing functions to smooth transitions
  applyEasing(positionAnimation)
  applyEasing(rotationAnimation)

  // Return both animations
  return { positionAnimation, rotationAnimation }
}

/**
 * Applies an easing function to an animation for smoother transitions.
 */
function applyEasing(animation) {
  let easingFunction = new babylon.CubicEase()
  easingFunction.setEasingMode(babylon.EasingFunction.EASINGMODE_EASEINOUT)
  animation.setEasingFunction(easingFunction)
}

/**
 * Generates keyframes for position and rotation animations.
 *
 * TODO: this needs some more work.  A very large jump in points still
 * results in a jumpy animation.  This will hold for now, but could be revisited
 */
function createKeys(positions, threshold = 0.2) {
  let positionKeys = []
  let rotationKeys = []

  function addKeyframes(startFrame, pos, rot, endFrame, nextPos, nextRot) {
    let distance = babylon.Vector3.Distance(pos, nextPos)

    if (distance > threshold) {
      // Calculate midpoint values
      let midFrame = (startFrame + endFrame) / 2
      let midPos = babylon.Vector3.Lerp(pos, nextPos, 0.1)
      let midRot = babylon.Quaternion.Slerp(rot, nextRot, 0.1)

      // Recursively add keyframes for the first half
      addKeyframes(startFrame, pos, rot, midFrame, midPos, midRot)

      // Recursively add keyframes for the second half
      addKeyframes(midFrame, midPos, midRot, endFrame, nextPos, nextRot)
    } 
    else {
      // Add keyframes when within threshold
      positionKeys.push({ frame: startFrame, value: pos })
      rotationKeys.push({ frame: startFrame, value: rot })
    }
  }

  for (let i = 0; i < positions.length - 1; i++) {
    let startFrame = i
    let endFrame = i + 1

    let pos = positions[i].location
    let nextPos = positions[i + 1].location

    let rot = positions[i].rotation
    let nextRot = positions[i + 1].rotation

    addKeyframes(startFrame, pos, rot, endFrame, nextPos, nextRot)

    // Ensure the final keyframe is always added
    positionKeys.push({ frame: endFrame, value: nextPos })
    rotationKeys.push({ frame: endFrame, value: nextRot })
  }

  return { positionKeys, rotationKeys }
}
