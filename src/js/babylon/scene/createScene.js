
import { createAnimatedCamera } from '../camera/camera.js'
import { addPostEffectPipeline } from '../postEffectPipeline.js'
import { AnimationController } from '../animation/animationController.js'
import { createLighting } from '../lighting.js'
import { loadMeshFromURL } from '../meshLoader.js'
import { setLoading } from '../../ui/loading.js'
import { meshLoaderEvents } from '../meshLoader'
import { trackPerformanceStats } from '../../ui/performanceStats.js'

let config = {
  camera: {
    alpha: -Math.PI / 4,
    beta:  Math.PI / 3,
    radius: 4,
    upperRadiusLimit: 7.0,
    lowerRadiusLimit: 2.0, // Increased from 1.1 to 2.0 to prevent camera from getting too close
    minZ: 0.1,
    maxZ: 1000,
  },
  engine: {
    // (Suggestion #10) Fine-tune engine creation
    preserveDrawingBuffer: true,
    stencil: true,
    disableWebGL2Support: false,
    antialias: false, // Disable built-in anti-aliasing to use FXAA
  },
}

export async function createScene(canvas, filePath) {
  let { Engine, Scene, PointerEventTypes } = await import('@babylonjs/core')
  let engine = null,
    scene = null,
    animationController = null

  try {
    // Create the js rendering engine
    engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      antialias: false, 
    })
    scene = new Scene(engine)

    // Initialize the animated camera and attach it to the scene
    let camera = await createAnimatedCamera(scene, canvas)

    addPostEffectPipeline(scene, camera)

    // Initialize the animation controller for handling camera animations
    animationController = new AnimationController(camera)

    // Setup lighting in the scene
    createLighting(scene)
    let octree = null

    // Load a mesh from a URL or file, if provided
    if (filePath) {
      try {
        octree = await loadMeshFromURL(scene, filePath, canvas)
      }
      catch (error) {
        console.error('Failed to load file:', error)
      }
      finally {
        meshLoaderEvents.addEventListener('octreeLoaded', (event) => {
          setLoading(false) // Hide loading UI once the file is processed
          console.log(event.detail)
          
        })
      }
    }

    trackPerformanceStats(scene, engine)

    // Start the render loop for continuous scene updates
    engine.runRenderLoop(() => scene.render())

    // Begin playing the camera animation
    animationController.play()

    // Resize the engine on window resize to maintain aspect ratio
    window.addEventListener('resize', () => engine.resize())

    // Pause animation when the user interacts with the scene
    scene.onPointerObservable.add(() => {
      animationController.pause()
    }, PointerEventTypes.POINTERDOWN)

    // Resume animation when the user presses 'Space'
    window.addEventListener('keydown', (event) => {
      if (event.code === 'Space') animationController.resume()
    })
  }
  catch (error) {
    console.error('Failed to initialize scene:', error)
    return null // Return null if initialization fails
  }

  // Return the scene, engine, and animation controller for further use
  return { engine, scene, animationController }
}
