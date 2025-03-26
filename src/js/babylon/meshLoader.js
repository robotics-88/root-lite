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
