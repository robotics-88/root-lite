import { loadMeshFromFile } from '../meshLoader.js'
import { setLoading } from '../../ui/loading.js'

export async function updateScene(scene, file, animationController) {
  setLoading(true)

  try {
    // Dispose of existing meshes
    scene.meshes.forEach((mesh) => mesh.dispose())
    // Load the new mesh
    await loadMeshFromFile(scene, file)
    animationController.reset()
  } catch (error) {
    console.error('Failed to update scene:', error)
  } finally {
    setLoading(false)
  }
}
