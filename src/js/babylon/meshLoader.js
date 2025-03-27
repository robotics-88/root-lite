import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import '@babylonjs/loaders/SPLAT'
import { Octree } from '../dataProcessing/Octree'
let loadedMeshes = []

let octree = null

/**
 * Prevents models from stacking up
 */
function clearPreviousMeshes() {
  loadedMeshes.forEach((mesh) => mesh.dispose())
  loadedMeshes = []
}

/**
 * Loads a mesh into the Babylon.js scene from a given url.
 */
export async function loadMeshFromURL(scene, url, canvas) {
  clearPreviousMeshes()
  let { SceneLoader } = await import('@babylonjs/core') //dynamic import for a large module

   let result = await SceneLoader.ImportMeshAsync('', url, '', scene, null, '.ply')
   // .then((result) => {
      // Access the loaded meshes
      result.meshes.forEach((mesh) => {
        // Apply scaling factor to each mesh
        mesh.isPickable = false // the raytracing for the splat image is very inaccurate and creates distracting issues
        // Extract positions from _splatPositions array
        let positions = mesh._splatPositions // Array of 3D positions for each point in the point cloud
        let points = []
        for(let i = 0; i< positions.length; i+=4){
          if(positions[i] !== 0 && positions[i+1] !== 0 && positions[i+2] !== 0) // 0,0,0 points cause infinte loop.  Not 100% sure why
            points.push(new Vector3(positions[i], positions[i+1], positions[i+2]))
        }
        octree = new Octree(points)
     // })
      loadedMeshes = result.meshes // Store so they can be cleared later

    })
    // .catch((error) => {
    //   console.error('Error loading mesh:', error)
    // })
    console.log(octree)
  return octree 
}

/**
 * Utility function to create a Blob URL and load the mesh.
 * This function handles both file and DataView sources.
 */
async function loadMeshFromBuffer(scene, arrayBuffer, canvas) {
  if (!arrayBuffer) return

  // Create a Blob from the file data, specifying the correct MIME type
  let blob = new Blob([arrayBuffer], { type: 'model/ply' })
  let blobUrl = URL.createObjectURL(blob) // Generate a URL for the Blob

  try {
    return await loadMeshFromURL(scene, blobUrl, canvas) // Load the model from the Blob URL
  }
  finally {
    URL.revokeObjectURL(blobUrl) // Cleanup to free memory
  }
}

/**
 * Loads a mesh from a user-selected file.
 */
export async function loadMeshFromFile(scene, file, canvas) {
  if (file) {
    // Convert the file into an ArrayBuffer and use the shared utility function
    let arrayBuffer = await file.arrayBuffer()
    return await loadMeshFromBuffer(scene, arrayBuffer, canvas)
  }
}

/**
 * Loads a mesh from a DataView extracted from a tarball.
 */
export async function loadMeshFromDataView(scene, arrayBuffer, canvas) {
  return await loadMeshFromBuffer(scene, arrayBuffer, canvas)
}
