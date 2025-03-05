import { createScene } from './babylon/scene/createScene.js'
import { updateScene } from './babylon/scene/updateScene.js'
import { loadMeshFromURL, loadMeshFromFile } from './babylon/meshLoader.js'
import { setLoading } from './ui/loading.js'

import checkEnvironmentVariables from './check-environment-variables'
checkEnvironmentVariables()

const FILE_PATH = import.meta.env.VITE_DEFAULT_SPLAT_FILE_PATH

let canvas = document.getElementById('renderCanvas')

// Load initial mesh
setLoading(true)
//loadMeshFromURL(scene, FILE_PATH, canvas).finally(() => setLoading(false))
let { engine, scene, animationController } = await createScene(canvas, {
  filePath: FILE_PATH,
})

// Handle file input
document
  .getElementById('fileInput')
  .addEventListener('change', async (event) => {
    let file = event.target.files[0]
    if (!file) return

    await updateScene(scene, file, animationController)
  })
