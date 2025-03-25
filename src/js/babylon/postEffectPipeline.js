import * as babylon from '@babylonjs/core'

let pipeline = null

export function addPostEffectPipeline(scene, camera) {
  // If pipeline already exists, dispose
  if (pipeline) {
    pipeline.dispose()
    pipeline = null
  }

  pipeline = new babylon.DefaultRenderingPipeline(
    "defaultPipeline",
    false,
    scene,
    [camera]
  )

  // Sharpen Settings
  pipeline.sharpenEnabled = true
  pipeline.sharpen.edgeAmount = 0.92

  // Enable FXAA (Anti-Aliasing) by default
  pipeline.fxaaEnabled = true
}