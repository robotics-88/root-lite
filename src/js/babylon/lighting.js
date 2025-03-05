import * as babylon from '@babylonjs/core'

export function createLighting(scene) {
  return new babylon.HemisphericLight(
    'light',
    new babylon.Vector3(0, 1, 0),
    scene
  )
}
