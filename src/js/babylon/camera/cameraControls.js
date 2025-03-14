import * as babylon from '@babylonjs/core'
import { meshLoaderEvents } from '../meshLoader'
/**
 * Adds custom camera controls for panning, rotating, and zooming using
 * mouse and touch interactions.
 */
export function addCameraControls(camera, canvas) {
  meshLoaderEvents.addEventListener('octreeLoaded', (event) => {
    console.log('octree: ', event.detail)
    let octree = event.detail
  let isPanning = false
  let isRotating = false
  let prevX = null,
    prevY = null,
    prevDistance = null
  let activeTouches = new Map()
  let rotationCenter = null
  let rayLine = null; // Store the line mesh
  // Handle pointer down events (mouse or touch)
  canvas.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'touch') {
      let pickResult = camera.getScene().pick(event.clientX, event.clientY);
      console.log(pickResult)
      if (event.button === 0) isPanning = true // Left click for panning
      else if (event.button === 2) {
        console.log('first if')
        isRotating = true;
        
        // Pick a point in the scene at the click location
        let pickResult = camera.getScene().pick(event.clientX, event.clientY);
        console.log(pickResult.ray)
        
        let intersection = octree.findIntersection(pickResult.ray)
        console.log(intersection)
        let scene = camera.getScene()
        let sphere = babylon.MeshBuilder.CreateSphere("sphere", {diameter: .02}, scene);
        sphere.position = intersection; // Set the position to the picked point
        sphere.material = new babylon.StandardMaterial("greenMat", scene); // Create material
        sphere.material.diffuseColor = new babylon.Color3(0, 1, 0); // Set color to green
        if (rayLine) {
          rayLine.dispose(); // Remove the previous ray line
      }
      const rayLength = 1000; // Length of the ray line
      const startPoint = pickResult.ray.origin; // Ray's starting point (camera)
      const endPoint = pickResult.ray.origin.add(pickResult.ray.direction.scale(rayLength)); // Correct way to calculate the endpoint

      const points = [startPoint.x, startPoint.y, startPoint.z, endPoint.x, endPoint.y, endPoint.z];
      console.log(points)
      rayLine = babylon.MeshBuilder.CreateLines("rayLine", { points: points, color: new babylon.Color3(1, 0, 0) }, camera.getScene()); // Create the red line mesh
        // if (pickResult.hit) {
        //   rotationCenter = pickResult.pickedPoint.clone(); // Store clicked point as rotation center

        //        // Create a green sphere at the picked point
        //        let sphere = babylon.MeshBuilder.CreateSphere("sphere", {diameter: .1}, scene);
        //        sphere.position = pickResult.pickedPoint; // Set the position to the picked point
        //        sphere.material = new babylon.StandardMaterial("greenMat", scene); // Create material
        //        sphere.material.diffuseColor = new babylon.Color3(0, 1, 0); // Set color to green
        // }
      }
      console.log(rotationCenter)
    }
    else
      activeTouches.set(event.pointerId, { x: event.clientX, y: event.clientY })
    
    prevX = event.clientX
    prevY = event.clientY
  })

  // Handle pointer move events for panning and rotation
  canvas.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch') {
      handleTouchMove(event)
      return
    }
    if (!isPanning && !isRotating) return

    let deltaX = event.clientX - prevX
    let deltaY = event.clientY - prevY
    prevX = event.clientX
    prevY = event.clientY

    if (isPanning) {
      // Adjust camera position based on movement
      let panFactor = 0.0015 //adjust to change panning speed
      camera.position.addInPlace(
        camera.getDirection(babylon.Axis.X).scale(-deltaX * panFactor),
      )
      camera.position.addInPlace(
        camera.getDirection(babylon.Axis.Y).scale(deltaY * panFactor),
      )
    }
    else if (isRotating) {
      // Adjust camera rotation based on movement
      let rotateFactor = 0.001 //adjust to change rotation speed
      camera.rotationQuaternion =
        camera.rotationQuaternion || babylon.Quaternion.Identity() //double check rotationQuaternion is defined
      let eulerRotation = camera.rotationQuaternion.toEulerAngles()
      eulerRotation.y -= deltaX * rotateFactor
      eulerRotation.x -= deltaY * rotateFactor

      camera.rotationQuaternion = babylon.Quaternion.RotationYawPitchRoll(
        eulerRotation.y,
        eulerRotation.x,
        eulerRotation.z,
      )
    }
  })

  // Handle pointer up events (mouse release or touch end)
  canvas.addEventListener('pointerup', (event) => {
    if (event.pointerType === 'touch') activeTouches.delete(event.pointerId)
    else {
      isPanning = false
      isRotating = false
    }
  })

  /**
   * Handles touch move events for both single-touch (panning) and
   * multi-touch (zooming) gestures.
   */
  function handleTouchMove(event) {
    if (!activeTouches.has(event.pointerId)) return
    let touchCount = activeTouches.size
    let prevTouch = activeTouches.get(event.pointerId)
    let deltaX = event.clientX - prevTouch.x
    let deltaY = event.clientY - prevTouch.y
    // Update stored touch position
    activeTouches.set(event.pointerId, { x: event.clientX, y: event.clientY })

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
      let touchArray = [...activeTouches.values()]
      let newDistance = Math.hypot(
        touchArray[0].x - touchArray[1].x,
        touchArray[0].y - touchArray[1].y,
      )

      if (prevDistance !== null) {
        let zoomFactor = 0.005
        let zoomDelta = (newDistance - prevDistance) * zoomFactor
        let direction = camera.getDirection(babylon.Axis.Z)
        camera.position.addInPlace(direction.scale(zoomDelta))
      }

      prevDistance = newDistance
    }
  }

  // Handle zooming with mouse wheel
  canvas.addEventListener('wheel', (event) => {
    event.preventDefault()
    let zoomFactor = -0.001
    let direction = camera.getDirection(babylon.Axis.Z)
    camera.position.addInPlace(direction.scale(event.deltaY * zoomFactor))
  })

  // Handle pointer cancellation events (e.g., losing focus)
  canvas.addEventListener('pointercancel', (event) =>
    activeTouches.delete(event.pointerId),
  )
  canvas.addEventListener('lostpointercapture', (event) =>
    activeTouches.delete(event.pointerId),
  )
})
}
