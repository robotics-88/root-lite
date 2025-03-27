import { HemisphericLight } from '@babylonjs/core/Lights'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'

export function createLighting(scene) {
  return new HemisphericLight(
    'light',
    new Vector3(0, 1, 0),
    scene,
  )
}
