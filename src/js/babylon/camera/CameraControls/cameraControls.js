import { handlePointerDown } from './handlers/pointerDown'
import { handleKeyDown } from './handlers/keydown'
import { handlePointerCancel } from './handlers/pointerCancel'
import { handlePointerMove } from './handlers/pointerMove'
import { handleWheel } from './handlers/wheel'

// Using a WeakMap here prevents memory leaks as once the 
// listeners are removed from the DOM they can be garbage collected
// and don't need to be explicitly removed from the Map
let listenerRegistry = new WeakMap()

/**
 * Adds custom camera controls for panning, rotating, and zooming using
 * mouse and touch interactions.
 */
export function addCameraControls(camera, canvas, octree) {
  function cleanupEventListeners() {
    if (listenerRegistry.has(canvas)) {
      listenerRegistry.get(canvas).forEach(({ event, handler }) => {
        canvas.removeEventListener(event, handler)
      })
      listenerRegistry.set(canvas, []) // Reset the array after cleanup
    }
  }
  
  cleanupEventListeners()
 
  let cameraControlsState = {
    octree: octree,
    isPanning: false,
    isRotating: false,
    prevX: null,
    prevY: null,
    prevDistance: null,
    activeTouches: new Map(),
    rotationCenter: null,
    rotationMarker: null,
    wheelTimeout: null,
  }
  
  let eventListeners = [
    { event: 'pointerdown', handler: (event) => handlePointerDown(event, camera, cameraControlsState) },
    { event: 'pointermove', handler: (event) => handlePointerMove(event, camera, cameraControlsState) },
    { event: 'pointercancel', handler: (event) => handlePointerCancel(event, cameraControlsState) },
    { event: 'lostpointercapture', handler: (event) => handlePointerCancel(event, cameraControlsState) },
    { event: 'wheel', handler: (event) => handleWheel(event, camera, cameraControlsState) },
    { event: 'keydown', handler: (event) => handleKeyDown(event, camera) },
    { event: 'pointerup', handler: (event) => {
      if (event.pointerType === 'touch') cameraControlsState.activeTouches.delete(event.pointerId)
      else {
        cameraControlsState.isPanning = false
        cameraControlsState.isRotating = false
      }
    } },
  ]

  eventListeners.forEach(({ event, handler }) => canvas.addEventListener(event, handler))
  // Store the listeners in WeakMap
  listenerRegistry.set(canvas, eventListeners)
}
