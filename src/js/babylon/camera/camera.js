import { UniversalCamera } from '@babylonjs/core/Cameras/universalCamera'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'

import { addAnimations } from '../animation/animation'
import { processCameraData } from '../../dataProcessing/colmap/parseFiles'
import { addCameraControls } from './CameraControls/cameraControls'

const IMAGES_FILE_PATH = import.meta.env.VITE_DEFAULT_IMAGES_FILE_PATH
const CAMERAS_FILE_PATH = import.meta.env.VITE_DEFAULT_CAMERAS_FILE_PATH

/**
 * Creates an animated camera in the scene based on parsed COLMAP camera positions.
 */
export async function createAnimatedCamera(scene, canvas, octree) {
  /**
   * URLs to COLMAP output files (for development).
   */
  let imagesURL = `${IMAGES_FILE_PATH}`
  let camerasURL = `$${CAMERAS_FILE_PATH}`

  // Fetch and process camera pose data from COLMAP files
  let { positions } = await processCameraData(imagesURL, camerasURL)

  // Create a UniversalCamera (similar to FreeCamera but allows extra controls)
  let camera = new UniversalCamera(
    'animatedCamera',
    new Vector3(0, 0, -1), // Initial position
    scene,
  )

  // Attach control to canvas
  camera.attachControl(canvas, true)

  // Camera configuration
  camera.minZ = 0.01 // Near clipping plane (helps with precision issues)
  camera.fov = 1 // Field of view
  camera.inertia = 0 // Disable built-in camera inertia for precise control
  camera.invertRotation = true // Correct orientation if needed
  camera.speed = 0.1 // Movement speed
  camera.angularSensibility = 1000 // Sensitivity for rotation

  // Remove default mouse input (will be replaced with custom controls)
  camera.inputs.removeByType('FreeCameraMouseInput')
  // Add custom camera controls
  addCameraControls(camera, canvas, octree)

  // Apply animations to the camera using the recorded positions
  addAnimations(positions, camera)

  return camera
}
