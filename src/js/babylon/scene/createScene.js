
import { createAnimatedCamera } from '../camera/camera.js'
import { addPostEffectPipeline } from '../postEffectPipeline.js'
import { AnimationController } from '../animation/animationController.js'
import { createLighting } from '../lighting.js'
import { loadMeshFromURL } from '../meshLoader.js'
import { setLoading } from '../../ui/loading.js'
import { trackPerformanceStats } from '../../ui/performanceStats.js'

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
        setLoading(false)
      }
    }

    // Initialize the animated camera and attach it to the scene
    let camera = await createAnimatedCamera(scene, canvas, octree)

    addPostEffectPipeline(scene, camera)

    // Initialize the animation controller for handling camera animations
    animationController = new AnimationController(camera)

    // THIS CAUSES AN ERROR ON MOBILE>>> NEEDS A REFACTOR
    //trackPerformanceStats(scene, engine)

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
