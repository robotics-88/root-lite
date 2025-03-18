import { loadMeshFromFile, loadMeshFromDataView } from '../meshLoader.js'
import { setLoading } from '../../ui/loading.js'
import { meshLoaderEvents } from '../meshLoader'

export async function updateScene(scene, file, animationController) {
  setLoading(true)

  try {
    // Dispose of existing meshes
    scene.meshes.forEach((mesh) => mesh.dispose())
    
    // Check if file is a DataView and call the appropriate function
    if (file instanceof DataView) await loadMeshFromDataView(scene, file.buffer)
    else await loadMeshFromFile(scene, file)

    //LEFT IN PLACE FOR DEV
    //animationController.reset()
  }
  catch (error) {
    console.error('Failed to update scene:', error)
  }
  finally {
    meshLoaderEvents.addEventListener('octreeLoaded', (event) => {
      setLoading(false)
    })
  }
}
