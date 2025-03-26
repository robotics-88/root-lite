import { extractTarballFiles } from './extractTarball'
import { updateScene } from '../babylon/scene/updateScene'

export async function processTarballFiles(scene, file, animationController) {
  try {
    let files = await extractTarballFiles(file)
    let textFiles = new Map()
    for (let { name, content } of files) {
      if (name.endsWith('.txt')) textFiles.set(name, content)
      else if (name.endsWith('.ply'))
        await updateScene(scene, content, animationController)
    }
    if (textFiles.has('images.txt') && textFiles.has('cameras.txt')) {
      animationController.resetCamera(
        textFiles.get('images.txt'),
        textFiles.get('cameras.txt'),
      )
    }
  }
  catch (error) {
    console.error('Issue loading Tarball files', error)
  }
}
