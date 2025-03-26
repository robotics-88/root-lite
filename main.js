import { createScene } from './src/js/babylon/scene/createScene.js'
import { updateScene } from './src/js/babylon/scene/updateScene.js'
import { setLoading } from './src/js/ui/loading.js'
import { setupDragAndDrop } from './src/js/ui/dragAndDrop.js'
import { setupInstructions } from './src/js/ui/instructions.js'
import { processTarballFiles } from './src/js/tarball/processTarball.js'

import checkEnvironmentVariables from './src/js/check-environment-variables.js'
checkEnvironmentVariables()

const FILE_PATH = import.meta.env.VITE_DEFAULT_SPLAT_FILE_PATH

let canvas = document.getElementById('render-canvas')

// Load initial mesh
setLoading(true)

// use an IIFE to avoid top level await which can still cause issues in some browsers
;(async () => {
  let { scene, animationController } = await createScene(canvas, FILE_PATH)

  // Handle file input
  document
    .getElementById('file-input')
    .addEventListener('change', async (event) => {
      setLoading(true)
      let file = event.target.files[0]
      if (!file) return
      else if (file.name.endsWith('.ply'))
        await updateScene(scene, file, animationController)
      else if (file.name.endsWith('.tar.gz'))
        await processTarballFiles(scene, file, animationController)
      setLoading(false)
    })

  // Handle drag and drop
  setupDragAndDrop(canvas, scene, animationController, updateScene)

  setupInstructions()
})()
