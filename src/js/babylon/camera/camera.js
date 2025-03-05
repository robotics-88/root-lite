import * as babylon from '@babylonjs/core'
import { addAnimations } from '../animation/animation'
import { processCameraData } from '../../colmap/parseFiles'
import { addCameraControls } from './cameraControls'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const IMAGES_FILE_PATH = import.meta.env.VITE_DEFAULT_IMAGES_FILE_PATH
const CAMERAS_FILE_PATH = import.meta.env.VITE_DEFAULT_CAMERAS_FILE_PATH

/**
 * Creates an animated camera in the scene based on parsed COLMAP camera positions.
 */
export async function createAnimatedCamera(scene, canvas) {
  /**
   * URLs to COLMAP output files (for development).
   */
  let imagesURL = `${API_BASE_URL}${IMAGES_FILE_PATH}`
  let camerasURL = `${API_BASE_URL}${CAMERAS_FILE_PATH}`

  // Fetch and process camera pose data from COLMAP files
  let { positions } = await processCameraData(imagesURL, camerasURL)

  // Create a UniversalCamera (similar to FreeCamera but allows extra controls)
  let camera = new babylon.UniversalCamera(
    'animatedCamera',
    new babylon.Vector3(0, 0, 0), // Initial position
    scene
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
  addCameraControls(camera, canvas)

  // If camera positions are available, use them to animate the camera
  // Disabled for now for troubleshooting
  // Condition should check if positions.length > 0
  if (false) {
    // Set the initial position from the first recorded pose
    let startPosition = positions[0].location
    camera.position = startPosition

    // Set the initial rotation from the first recorded pose
    let startRotation = positions[0].rotation
    camera.rotationQuaternion = startRotation

    // Apply animations to the camera using the recorded positions
    addAnimations(positions, camera)
  }

  return camera
}
