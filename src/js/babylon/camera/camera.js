import { UniversalCamera } from '@babylonjs/core/Cameras/universalCamera'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'

import { addAnimations } from '../animation/animation'
import { processCameraData } from '../../dataProcessing/colmap/parseFiles'
import { addCameraControls } from './CameraControls/cameraControls'

const IMAGES_FILE_PATH = '/images.txt'
const CAMERAS_FILE_PATH = '/cameras.txt'

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

  //This location and rotation is hard-coded for the house.ply file
  let camera = new UniversalCamera(
    'animatedCamera',
    new Vector3(0.2582561149732623, 0.4352873804918741,  1.2821967902890605), 
    scene,
  )
  
  camera.rotation.x = 0.48729636166695894  
  camera.rotation.y = -2.764540615291023
  camera.rotation.z = 1.829327364167595


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
