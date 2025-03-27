import { loadMeshFromFile, loadMeshFromDataView } from '../meshLoader.js'
import { setLoading } from '../../ui/loading.js'

export async function updateScene(scene, file, animationController) {
  setLoading(true)

  try {
    // Dispose of existing meshes
    scene.meshes.forEach((mesh) => mesh.dispose())
    
    // Check if file is a DataView and call the appropriate function
    let octree = file instanceof DataView ? await loadMeshFromDataView(scene, file.buffer) : await loadMeshFromFile(scene, file)
    console.log(octree)
    //TODO : ADD IN RESET OF CAMERA CONTROLS!!!

    //LEFT IN PLACE FOR DEV
    //animationController.reset()
  }
  catch (error) {
    console.error('Failed to update scene:', error)
  }
  finally {
    setLoading(false)
  }
}
