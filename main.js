import { createScene } from './src/js/babylon/scene/createScene.js'
import { updateScene } from './src/js/babylon/scene/updateScene.js'
import { setLoading } from './src/js/ui/loading.js'
import { setupDragAndDrop } from './src/js/ui/dragAndDrop.js'
import { extractTarballFiles } from './src/js/ui/tarball/extractTarball.js'

import checkEnvironmentVariables from './src/js/check-environment-variables.js'
checkEnvironmentVariables()

const FILE_PATH = import.meta.env.VITE_DEFAULT_SPLAT_FILE_PATH

let canvas = document.getElementById('renderCanvas')



// Load initial mesh
setLoading(true)

// use an IIFE to avoid top level await which can still cause issues in some browsers
;(async () => {
  let { scene, animationController } = await createScene(canvas, {
    filePath: FILE_PATH,
  })

  // Handle file input
  document
    .getElementById('fileInput')
    .addEventListener('change', async (event) => {
      let file = event.target.files[0]
      if (!file) return
      else if(file.name.endsWith('.ply')) await updateScene(scene, file, animationController)
      else if(file.name.endsWith('.tar.gz')){
        console.log('tar.gz file')
        let files = await extractTarballFiles(file)
        for (let { name, content } of files) {
          if (name.endsWith('.txt')) {
            console.log(name)
            // processTxtFile(new TextDecoder().decode(new Uint8Array(content.buffer)))
          } 
          else if (name.endsWith('.ply')) {
            await updateScene(scene, content, animationController)
          }
        }
      }       
    })
  
  // Handle drag and drop
  setupDragAndDrop(canvas, scene, animationController, updateScene)

  
})()
