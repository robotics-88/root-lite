import * as babylon from '@babylonjs/core'
import '@babylonjs/loaders'

let loadedMeshes = []

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
  let scale = 2 // Scaling factor for the mesh
  clearPreviousMeshes()
  babylon.SceneLoader.ImportMeshAsync('', url, '', scene, null, '.ply')
    .then((result) => {
      // Access the loaded meshes
      result.meshes.forEach((mesh) => {
        // Apply scaling factor to each mesh
        mesh.scaling = new babylon.Vector3(scale, scale, scale)
      })
      loadedMeshes = result.meshes // Store so they can be cleared later
    })
    .catch((error) => {
      console.error('Error loading mesh:', error)
    })
}

/**
 * Loads a mesh from a user-selected file.
 * Reads the file and converts it into a Blob URL before loading.
 */
export async function loadMeshFromFile(scene, file, canvas) {
  if (file) {
    //Will need to expand this to actually account for the tarball sending .txt files

    // Convert the file into an ArrayBuffer
    let arrayBuffer = await file.arrayBuffer()
    let uint8Array = new Uint8Array(arrayBuffer)

    // Create a Blob from the file data, specifying the correct MIME type
    let blob = new Blob([uint8Array], { type: 'model/ply' })
    let blobUrl = URL.createObjectURL(blob) // Generate a URL for the Blob

    try {
      return await loadMeshFromURL(scene, blobUrl, canvas) // Load the model from the Blob URL
    } finally {
      URL.revokeObjectURL(blobUrl) // Cleanup to free memory
    }
  }
}
