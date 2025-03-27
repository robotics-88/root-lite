import { saveCameraState } from '../../cameraHistory'
import { getBaseCameraRotation } from '../../../../ui/rotateTool'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'

export function handlePointerDown(event, camera, state) {
  event.preventDefault()

  if (event.pointerType !== 'touch') {
    let pickResult = camera.getScene().pick(event.clientX, event.clientY)
    // console.log(pickResult)
    if (event.button === 0) state.isPanning = true // Left click for panning
    else if (event.button === 2) {
      state.isRotating = true
      
      let intersection = state.octree.findIntersection(pickResult.ray)
      state.rotationCenter = intersection ? intersection.clone() : camera.target.clone()
      
      // Smoothly transition the target to rotationCenter
      camera.setTarget(Vector3.Lerp(camera.target, state.rotationCenter, .01))
      /**
       * this code block adds a sphere at the intersection.  It is handy for debugging,
       * leaving it for DEV for now
       */
      // if (intersection) {
      //   const sphere = MeshBuilder.CreateSphere('intersectionSphere', { diameter: 0.2 }, camera.getScene())
      //   sphere.position = intersection
      //   sphere.material = new StandardMaterial('green', camera.getScene())
      //   sphere.material.diffuseColor = new Color3(0, 1, 0) // Green color
      // }
      // console.log(camera.getScene())

    } 
  }
  else state.activeTouches.set(event.pointerId, { x: event.clientX, y: event.clientY })

  state.prevX = event.clientX
  state.prevY = event.clientY
  camera.rotation.z = getBaseCameraRotation()
  saveCameraState(camera.position.clone(), camera.target.clone())
}